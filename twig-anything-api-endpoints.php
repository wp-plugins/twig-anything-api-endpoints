<?php
/*
Plugin Name: API Endpoints
Plugin URI:  http://twiganything.com/wordpress-api-endpoints
Description: Add WordPress API endpoints and access your site's data in JSON, XML, RSS/ATOM or YAML.
Version:     1.0
Author:      Anton Andriievskyi
Author URI:  https://twiganything.com/author
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Domain Path: /languages
Text Domain: twig-anything-api-endpoints

*/

/*

Developer notes:
- Create separate WP users for API calls
- By default, only no-cache headers are sent
- Configure additional headers depending on your API result format (JSON, XML etc.)
- If no username provided, tries to use the currently authenticated user
- To make the API public, do not enter any capability
- Detailed error messages are only shown to admins

*/

namespace TwigAnythingApiEndpoints;

use Twig_Loader_Array;
use TwigAnything\DataSources\DataSourceConfigurationException;
use TwigAnything\DataSources\DataSourceException;
use TwigAnything\Formats\FormatConfigurationException;
use TwigAnything\Formats\FormatException;
use TwigAnything\TwigAnything;
use TwigAnything\TwigAnythingException;
use TwigAnything\TwigHelper;
use TwigAnything\TwigTemplate;
use TwigAnything\TwigTemplateLoadException;

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

class Plugin
{
    const OPTION_NAME_SETTINGS = 'twig_anything_api_endpoint_settings';
    const OPTION_NAME_API_ENDPOINTS = 'twig_anything_api_endpoints_list';
    const OPTION_NAME_API_SUCCESS_TEMPLATE = 'twig_anything_api_endpoint_success_tmpl';
    const OPTION_NAME_API_ERROR_TEMPLATE = 'twig_anything_api_endpoint_err_tmpl';
    const OPTION_NAME_API_HEADERS = 'twig_anything_api_endpoint_headers';
    const DEFAULT_REWRITE_ENDPOINT_NAME = 'api-endpoint';
    const DEFAULT_API_ERROR_TEMPLATE = <<<JSON
{
    "code": {{ error_code|json }},
    "message": {{ error_message|json }}
}
JSON;
    const DEFAULT_API_SUCCESS_TEMPLATE = <<<JSON
{
    "code": "OK",
    "result": {{ result }}
}
JSON;


    public static function pluginDir() {
        return __DIR__;
    }

    public static function pluginFile() {
        return self::pluginDir() . '/twig-anything-api-endpoints.php';
    }

    public function setup() {
        register_activation_hook(self::pluginFile(), array($this, 'onActivate'));
        register_deactivation_hook(self::pluginFile(), array($this, 'onDeactivate'));
        add_action('init', array($this, 'onInit'));
        add_action('template_redirect', array($this, 'onTemplateRedirect'));
        add_action('admin_menu', array($this, 'onAdminMenu'));
        add_action('admin_enqueue_scripts', array($this, 'onAdminEnqueueScripts'));
        add_action('wp_ajax_twig_anything_api_endpoint_save_settings', array($this, 'onAjaxSaveSettings'));
    }

    /**
     * Returns the default settings.
     * Must be a one-dimensional array!
     * @return array
     */
    public static function getDefaultSettings() {
        return array(
            'rewrite_endpoint_name' => self::DEFAULT_REWRITE_ENDPOINT_NAME,
        );
    }

    public static function loadAndNormalizeSettings() {
        $settings = get_option(self::OPTION_NAME_SETTINGS, $default = false);
        if ($settings === false || $settings === null || !is_array($settings)) {
            $settings = array();
        }

        if (!array_key_exists('rewrite_endpoint_name', $settings)
            || !is_scalar($settings['rewrite_endpoint_name'])) {
            $settings['rewrite_endpoint_name'] = self::DEFAULT_REWRITE_ENDPOINT_NAME;
        }

        return $settings;
    }

    public static function loadAndNormalizeApiEndpoints() {
        $names = get_option(self::OPTION_NAME_API_ENDPOINTS, $default = false);
        if ($names === false || $names === null || !is_array($names)) {
            $names = array();
        }
        $normalizedNames = array();
        foreach($names as $meta) {
            if (!is_array($meta)) {
                continue;
            }
            # API slug
            if (!array_key_exists('api_slug', $meta)) {
                continue;
            }
            if (!is_scalar($meta['api_slug'])) {
                continue;
            }
            # Capability
            if (!array_key_exists('capability', $meta)) {
                continue;
            }
            if (!is_scalar($meta['capability'])) {
                continue;
            }
            # Twig Template slug or id
            if (!array_key_exists('twig_template_slug_or_id', $meta)) {
                continue;
            }
            if (!is_scalar($meta['twig_template_slug_or_id'])) {
                continue;
            }
            $normalizedNames[] = $meta;
        }
        return $normalizedNames;
    }

    public static function loadAndNormalizeApiHeaders() {
        $headers = get_option(self::OPTION_NAME_API_HEADERS);
        $normalizedHeaders = array();
        foreach($headers as $h) {
            if (!is_array($h)) {
                continue;
            }
            if (!array_key_exists('header', $h)) {
                continue;
            }
            $normalizedHeaders[] = $h;
        }
        return $normalizedHeaders;
    }

    public static function getDefaultHeaders() {
        return array(
            array(
                'header' => 'Cache-Control: no-cache, no-store, must-revalidate',
            ),
            array(
                'header' => 'Pragma: no-cache',
            ),
            array(
                'header' => 'Expires: 0'
            )
        );
    }

    public static function registerRewriteEndpoint() {
        $settings = self::loadAndNormalizeSettings();
        $endpointName = $settings['rewrite_endpoint_name'];
        if ($endpointName !== '') {
            add_rewrite_endpoint($endpointName, EP_ROOT);
        }
    }

    /**
     * WordPress activation hook
     */
    public function onActivate() {
        # Save default settings
        $settings = self::getDefaultSettings();
        # ...existing options will not be updated
        add_option(self::OPTION_NAME_SETTINGS, $settings, $deprecated = '', $autoload = 'yes');

        # Set endpoint names to an empty array. DO NOT autoload this option!
        add_option(self::OPTION_NAME_API_ENDPOINTS, array(), $deprecated = '', $autoload = 'no');

        # Set user configurable template for API errors. DO NOT autoload this option!
        add_option(self::OPTION_NAME_API_ERROR_TEMPLATE, self::DEFAULT_API_ERROR_TEMPLATE, $deprecated = '', $autoload = 'no');

        # Set user configurable template for successful API results. DO NOT autoload this option!
        add_option(self::OPTION_NAME_API_SUCCESS_TEMPLATE, self::DEFAULT_API_SUCCESS_TEMPLATE, $deprecated = '', $autoload = 'no');

        # Set user configurable headers for the API endpoint to an empty array.
        # DO NOT autoload this option!
        add_option(self::OPTION_NAME_API_HEADERS, array(), $deprecated = '', $autoload = 'no');

        # Register rewrite endpoint
        self::registerRewriteEndpoint();

        # Flush rewrite rules so that API endpoint is accessible right away.
        # Flushing makes no sense without calling
        # the rewrite endpoint registration routine above!
        flush_rewrite_rules();
    }

    /**
     * WordPress deactivation hook - remove our rewrite rule.
     */
    public function onDeactivate() {
        flush_rewrite_rules();
    }

    /**
     * 'init' WordPress action
     */
    public function onInit() {
        # Register rewrite endpoint. It should be done in the `init` action
        # as by this tutorial:
        # https://make.wordpress.org/plugins/2012/06/07/rewrite-endpoints-api/
        self::registerRewriteEndpoint();
    }

    public static function getApiMetaBySlug($slug) {
        $endpoints = self::loadAndNormalizeApiEndpoints();
        foreach ($endpoints as $meta) {
            if ($meta['api_slug'] === $slug) {
                return $meta;
            }
        }
        return null;
    }

    /**
     * 'template_redirect' WordPress action.
     * This is the main API processor.
     */
    public function onTemplateRedirect() {
        # It would make sense to only proceed if either home or front page.
        # However, with some themes it might not work!
        # So we have no other options but to always check for the api endpoint
        # presence in the URL!
        # DO NOT UNCOMMENT THIS. Used for developer notes only.
        #if (!is_home() && !is_front_page()) {
        #    return;
        #}

        # Get the path to the API in URLs, which is configurable.
        $settings = self::loadAndNormalizeSettings();
        $rewriteEndpointName = $settings['rewrite_endpoint_name'];
        if ($rewriteEndpointName === '') {
            return;
        }

        # Now that we have the path, extract the corresponding query variable.
        # The value of the variable is the name of the api to call.
        global $wp_query;
        if (!array_key_exists($rewriteEndpointName, $wp_query->query_vars)) {
            return;
        }
        $apiSlug = trim($wp_query->query_vars[$rewriteEndpointName]);



        # The API output
        $output = null;

        # User accessing the API.
        # Anonymous by default (a valid case for public APIs)
        $userId = null;

        try {
            # Make sure there is some API to call
            # Example: /api-endpoint/slug OR ?api-endpoint=slug
            if ($apiSlug === '') {
                throw new ApiUnknownException(__('Unknown API', 'twig-anything-api-endpoints'));
            }

            # Detect which user to use for the API call and
            # check username/password if required

            # If username has been provided, use it instead of the current session
            if (array_key_exists('username', $_REQUEST)) {
                if (!array_key_exists('password', $_REQUEST)) {
                    throw new ApiAuthenticationException(__('Password not specified.', 'twig-anything-api-endpoints'));
                }
                $username = wp_unslash(trim($_REQUEST['username']));
                $user = get_user_by('login', $username);
                if (!$user) {
                    throw new ApiAuthenticationException(_('Wrong login/password', 'twig-anything-api-endpoints'));
                }
                $password = trim(wp_unslash($_REQUEST['password']));
                if (!wp_check_password($password, $user->data->user_pass, $user->ID)) {
                    throw new ApiAuthenticationException(__('Wrong login/password'), 'twig-anything-api-endpoints');
                }
                $userId = $user->ID;
            }
            # If no username has been provided, then try using the current user
            elseif (is_user_logged_in()) {
                $userId = get_current_user_id();
            }

            $apiMeta = self::getApiMetaBySlug($apiSlug);
            if (empty($apiMeta)) {
                throw new ApiUnknownException(__('Unknown API', 'twig-anything-api-endpoints'));
            }

            # Check if user has capability to access the API
            $capability = trim($apiMeta['capability']);
            if ($capability !== '') {
                if (!user_can($userId, $capability)) {
                    throw new ApiAuthenticationException(__('No permission to access the API', 'twig-anything-api-endpoints'));
                }
            }

            $slugOrId = trim($apiMeta['twig_template_slug_or_id']);
            if ($slugOrId === '') {
                throw new ApiException(__('Empty Twig Template slug or id', 'twig-anything-api-endpoints'));
            }

            # Load Twig Template

            # If loading fails, an exception is thrown instead of returning NULL
            if (ctype_digit($slugOrId)) {
                $template = TwigTemplate::loadById($slugOrId);
            }
            else {
                $template = TwigTemplate::loadPublishedBySlug($slugOrId);
            }

            $output = $template->render(array(
                'isRemoveLineBreaksFromTemplate' => false,
                'twigConfigOverride' => array(
                    'autoescape' => false
                )
            ));

            # At this point, $output is the rendering result for the API template.
            # Now, we have to pass it through the "API success" template.
            $data = array(
                'result' => $output,
            );

            $successTemplate = get_option(self::OPTION_NAME_API_SUCCESS_TEMPLATE, $default = false);
            $successTemplate = trim($successTemplate);
            $twig = TwigHelper::newTwigEnvironment(array(
                'autoescape' => false
            ));
            TwigHelper::addCommonFilters($twig);

            # Render the API error template
            $twig->setLoader(new Twig_Loader_Array(array(
                'api_success' => $successTemplate
            )));
            $twigTemplate = $twig->loadTemplate('api_success');
            $output = $twigTemplate->render($data);
        }
        catch (\Exception $e) {
            # If an error happens, render a twig error template,
            # which is user configurable

            if ($e instanceof TwigTemplateLoadException) {
                $code = 'CANNOT_LOAD_TWIG_TEMPLATE_ERROR';
            }
            elseif ($e instanceof DataSourceConfigurationException) {
                $code = 'DATA_SOURCE_CONFIGURATION_ERROR';
            }
            elseif ($e instanceof DataSourceException) {
                $code = 'DATA_SOURCE_ERROR';
            }
            elseif ($e instanceof FormatConfigurationException) {
                $code = 'FORMAT_CONFIGURATION_ERROR';
            }
            elseif ($e instanceof FormatException) {
                $code = 'FORMAT_ERROR';
            }
            elseif ($e instanceof TwigAnythingException) {
                $code = 'TWIG_TEMPLATE_ERROR';
            }
            elseif ($e instanceof ApiAuthenticationException) {
                $code = 'AUTHENTICATION_ERROR';
            }
            elseif ($e instanceof ApiUnknownException) {
                $code = 'API_NOT_FOUND_ERROR';
            }
            elseif ($e instanceof ApiException) {
                $code = 'API_CONFIGURATION_ERROR';
            }
            else {
                $code = 'UNKNOWN_ERROR';
            }

            # Check if we should include the error message
            $isDebug = defined('WP_DEBUG')? (bool)WP_DEBUG : false;
            $isAdmin = current_user_can('delete_users');
            if ($isDebug || $isAdmin) {
                $message = $e->getMessage();
            }
            else {
                $message = __('Call API with admin privileges or set WP_DEBUG to 1 to show detailed errors messages in API results.', 'twig-anything-api-endpoints');
            }

            $data = array(
                'error_code' => $code,
                'error_message' => $message,
                'api_user_id' => $userId,
                'exception' => $e
            );

            $errorTemplate = get_option(self::OPTION_NAME_API_ERROR_TEMPLATE, $default = false);
            $errorTemplate = trim($errorTemplate);
            $twig = TwigHelper::newTwigEnvironment(array(
                'autoescape' => false
            ));
            TwigHelper::addCommonFilters($twig);

            # Render the API error template
            $twig->setLoader(new Twig_Loader_Array(array(
                'api_error' => $errorTemplate
            )));
            $twigTemplate = $twig->loadTemplate('api_error');
            $output = $twigTemplate->render($data);
        }

        # Now that we have the result, just output it and exit.

        # First, output anti-cache headers
        $defaultHeaders = self::getDefaultHeaders();
        foreach($defaultHeaders as $h) {
            header($h['header']);
        }

        # Next, output custom user headers, if any
        $customHeaders = self::loadAndNormalizeApiHeaders();
        foreach($customHeaders as $header) {
            header($header['header'], $replace = true);
        }

        # Finally, output the API result
        echo $output;
        exit;
    }

    /**
     * 'admin_menu' WordPress action.
     */
    public function onAdminMenu() {
        # Load PHP file later than sooner because it is needed rarely
        require_once __DIR__.'/OptionsPage.php';
        $optionsPage = new OptionsPage;
        $optionsPage->setup();
    }

    /**
     * 'admin_enqueue_scripts' WordPress action
     */
    public function onAdminEnqueueScripts() {
        $screen = get_current_screen();
        # Only React component on our settings page
        if (!is_admin() || $screen->id !== 'settings_page_twig_anything_api_endpoint_settings_page') {
            return;
        }

        $pluginFile = self::pluginFile();

        # Settings page React component and initialization script
        TwigAnything::registerReactJs();
        wp_enqueue_script(
            'twig_anything_api_endpoint_settings_page',
            plugins_url('jsx/settings.js', $pluginFile),
            array('jquery', 'twig_anything_react_with_addons'),
            $ver = '1'
        );
    }

    public function onAjaxSaveSettings() {
        # Load PHP file later than sooner because it is needed rarely
        require_once __DIR__.'/OptionsPage.php';
        $optionsPage = new OptionsPage;
        $optionsPage->save();
    }
}

$twigAnythingApiEndpoint = new Plugin;
$twigAnythingApiEndpoint->setup();

class ApiException extends \RuntimeException {};
class ApiAuthenticationException extends ApiException{};
class ApiUnknownException extends ApiException {};