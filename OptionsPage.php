<?php

namespace TwigAnythingApiEndpoints;

use TwigAnything\WpUtils;

class OptionsPage
{
    public function setup() {
        $hookSuffix = add_options_page(
            $page_title  = __('API Endpoints for Twig Anything', 'twig-anything-api-endpoints'),
            $menu_title  = __('API Endpoints', 'twig-anything-api-endpoints'),
            $capability  = 'manage_options',
            $menu_slug   = 'twig_anything_api_endpoint_settings_page',
            array($this, 'echoAdminPage')
        );
    }

    public function echoAdminPage() {
        # Generate a nonce so we can check for it later
        $nonce = wp_create_nonce('twig_anything_post_meta_box');

        $settings = Plugin::loadAndNormalizeSettings();
        $endpoints = Plugin::loadAndNormalizeApiEndpoints();
        $headers = Plugin::loadAndNormalizeApiHeaders();
        $successTemplate = get_option(Plugin::OPTION_NAME_API_SUCCESS_TEMPLATE, '');
        $errorTemplate = get_option(Plugin::OPTION_NAME_API_ERROR_TEMPLATE, '');

        $config = array(
            'nonce'      => $nonce,
            'wpHomeUrl' => home_url(),
            'defaultHeaders' => Plugin::getDefaultHeaders(),
            'reactSettings' => array(
                'settings'   => $settings,
                'endpoints'   => $endpoints,
                'headers' => $headers,
                'successTemplate' => $successTemplate,
                'errorTemplate' => $errorTemplate
            ),
        );

        # Encode config to JSON with the strict way so that it's suitable for HTML
        $json = WpUtils::jsonEncodeForHtml($config);

        $loadingLocalized = __('Loading...', 'twig-anything');

        echo <<<HTML
<style>
    .api-url-example { font-style: normal; }
    .endpoint-example-node {
        display: inline-block; padding: 0 2px
    }
    .api-url, #twig_anything_api_endpoint_name { color: green; }
    .endpoint-slug, input.endpoint-slug { color: blue; }
    input.endpoint-slug { font-weight: bold; width: 19em; }
    #twig_anything_api_endpoint_name { font-weight: bold; }
    table.api-endpoint-headers tr, table.api-endpoint-headers td,
    table.api-endpoints tr, table.api-endpoints td {
        margin: 0; padding: 0;
    }
    input.api-endpoint-header { width: 80% }
    .api-endpoint-arrow { display: inline-block; font-weight: bold; padding: 0 1px; }
    input.url-endpoint-capability { width: 19em; }
</style>
<div class="wrap">
    <div id="twig-anything-api-endpoints-react-container">$loadingLocalized</div>
    <script>
        var twigAnythingApiEndpointSettingsInputData = {$json};
    </script>
</div>
HTML;
    }

    public function save() {
        $settings = wp_unslash($_POST['settings']);
        $settings['rewrite_endpoint_name'] = trim($settings['rewrite_endpoint_name']);

        $endpoints = wp_unslash($_POST['endpoints']);
        if (empty($endpoints)) {
            $endpoints = array();
        }

        $headers = wp_unslash($_POST['headers']);
        if (empty($headers)) {
            $headers = array();
        }

        $successTemplate = wp_unslash($_POST['successTemplate']);
        $errorTemplate = wp_unslash($_POST['errorTemplate']);

        # Force the creation of options if they do not exist
        $oldSettings = Plugin::loadAndNormalizeSettings();
        Plugin::loadAndNormalizeApiEndpoints();
        Plugin::loadAndNormalizeApiHeaders();

        update_option(Plugin::OPTION_NAME_SETTINGS, $settings);
        update_option(Plugin::OPTION_NAME_API_ENDPOINTS, $endpoints);
        update_option(Plugin::OPTION_NAME_API_HEADERS, $headers);
        update_option(Plugin::OPTION_NAME_API_SUCCESS_TEMPLATE, $successTemplate);
        update_option(Plugin::OPTION_NAME_API_ERROR_TEMPLATE, $errorTemplate);

        # Update rewrite engine if changed
        if ($settings['rewrite_endpoint_name'] !== ''
            && $oldSettings['rewrite_endpoint_name'] !== $settings['rewrite_endpoint_name']) {
            # Register rewrite endpoint
            Plugin::registerRewriteEndpoint();

            # Flush rewrite rules so that API endpoint is accessible right away.
            # Flushing makes no sense without calling
            # the rewrite endpoint registration routine above!
            flush_rewrite_rules();
        }
    }
}