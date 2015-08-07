=== Twig Anything API Endpoints ===
Contributors: meglio
Tags: api, rest, restful, integration, api client, api endpoint, access point, json, xml, twig
Requires at least: 3.6.1
Tested up to: 4.2.3
Stable tag: trunk
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Add WordPress API endpoints and access your site's data in JSON, XML, RSS/ATOM, YAML or HTML.



== Description ==

Choose which of your site's data to make available via WordPress API
and in which format.

= Features =

* Customize API URLs: <code>http://mywordpress.com/my-api/name1</code> - change **my-api** and **name1** in the plugin settings
* Set minimal capability permission individually for every API endpoint
* Customize HTTP headers
* Use any data from your sites's MySQL database: posts/pages, custom posts, comments, settings, users, site options, post metadata, users, drafts, activity and much more
* Turn any local file into an API (CSV, JSON, XML, you name it)
* Fetch any data from 3rd party APIs and turn into your own API
* Boost API speed with the caching system out of the box
* Output API in any format, including, but not limited to, JSON, XML, RSS/ATOM, YAML and HTML.
* Get full control over the API output by using a simple template language.
* Two dedicated templates: 1) for successful API calls and 2) for API failures (e.g. authentication error)
* Intelligent template editor with code highlighting and full screen mode

This is a free add-on to the
[Twig Anything](https://twiganything.com/ "Twig Anything") WordPress plugin.



== Installation ==

= Minimum Requirements =

* WordPress 3.6.1 or greater
* PHP version 5.4 or greater
* MySQL version 5.0 or greater
* [Twig Anything](https://twiganything.com) WordPress plugin version 1.5 or greater

= Automatic installation =

Automatic installation is the easiest option as WordPress handles the file transfers itself and you don’t need to leave your web browser. To do an automatic install of API Endpoints, log in to your WordPress dashboard, navigate to the Plugins menu and click Add New.

In the search field type “API Endpoints” and click Search Plugins. Once you’ve found the plugin, you can view details about it such as the the point release, rating and description. Most importantly, of course, you can install it by simply clicking “Install Now”.

= Manual installation =

The manual installation method involves downloading the API Endpoints plugin and uploading it to your webserver via your favourite FTP application. The WordPress codex contains [instructions on how to do this here](http://codex.wordpress.org/Managing_Plugins#Manual_Plugin_Installation).

= Updating =

Automatic updates should work like a charm; as always though, ensure you backup your site just in case.

1. Upload `twig-anything-api-endpoints.zip` to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress




== Frequently Asked Questions ==




== Screenshots ==

1. The slick API Endpoints configuration panel with settings for error/success templates, URL names, capability roles set individually per API endpoint, and templates to use for each API.
2. HTTP headers configuration: by default, anti-cache headers are set, but you can add any headers depending on what format you want your API to output. It hints you about headers to use for most popular formats: JSON, XML, RSS and YAML.
3. An API endpoint in JSON format that gets information from a local CSV file and converts it into API.
4. Insufficient permissions when calling a protected API with a wrong username/password



== Changelog ==

= 1.0 =
* The first release
