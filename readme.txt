=== API Endpoints ===
Contributors: meglio
Tags: api, REST, RESTful, integration, api client, api endpoint, api access, access point, endpoint, JSON, XML, CSV, Twig, URI, URL, share data, access data, api format, api output, ajax, http, links, protected api, api authentication, cache api, api interface, http interface, web service, convert to api, create api, add api,SOAP, REST style, api request, api response, api location, api url, api uri, endpoint url, multiple APIs, JSON API, XML API, CSV API, database API, API from database, http headers, API headers, api speed
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

= What formats can my API Endpoints output in? =

JSON, XML, CSV (comma separated values), YAML and pretty much anything with just a bit of config. You have full control of what is output and which format.


= How many API Endpoints can I create? =

Create as many endpoints as you need. There are no limits!


= Can I control access to my API Endpoints? =

Yes, you can configure a minimum user role required for each endpoint separately. You will then pass `username` and `password` variables in your call to the API, which will be used to authenticate with your existing WordPress users.


= Can I configure access to each API Endpoint separately? =

Yes, every single API Endpoint has its own optional minimal role required to access the API.


= Should I create a separate WordPress user to access API Endpoints? =

If your API is public and meant to be accessed by anyone, then no.

However, if you API needs authentication, then I recommend creating a separate WordPress user and using its username/password to access the API. A separate WP account for consuming your API would make it easier to switch it ON/OFF or change its permission level accordingly when required.


= Can I configure the URL to my API? =

By default, you would access your API endpoint by a URL like this:

`http://my-wordpress.com/api-endpoint/endpoint-name`

... where `api-endpoint` is the common root URL, and `endpoint-name` is unique for every endpoint. Both of these pieces are configurable in the settings screen.


= Can I control HTTP headers output by an API endpoint? =

Yes, you can configure HTTP headers in the settings screen. To access it, click on the "Settings" menu and then on the "API Endpoints" sub-menu.


= What if API returns an error? =

As any API, yours can return an error. For example, if someone tries to access a protected API endpoint without appropriate authentication. If this is the case, the *Error Template* from the settings screen will be used.

There is a default error template in JSON format in place, but you can easily tune it to your own needs.


= How can I preview the API output? =

In the *Settings* screen, in front of every api endpoint there is an *"Open"* button. Clicking on it opens a new tab in your browser linking to the URL the API.

You can also use special tools to test you API, for example [Postman](https://www.getpostman.com/).


= Why does it require Twig Anything plugin? =

Twig Anything is a super-powerful plugin that allows to fetch any data from anywhere and display it in your WordPress site. It is universal and extensible, and already has a lot of things like intelligent error handling and local cache. It also understands Twig syntax, which allows for endless applications and various scenarios. "API Endpoints" greatly benefits from all of this!

Last but not least, the developer behind both plugins is the same :)


= Can I turn a CSV file into an API? =

Yes! You will need [CSV Format](https://wordpress.org/plugins/twig-anything-csv/) add-on to read let it data from a CSV file.


= Can I turn someone else's API into my own API? =

Yes, just configure your Twig Template to fetch data from a URL and then output it either entirely or partially in your template.



== Screenshots ==

1. The slick API Endpoints configuration panel with settings for error/success templates, URL names, capability roles set individually per API endpoint, and templates to use for each API.
2. HTTP headers configuration: by default, anti-cache headers are set, but you can add any headers depending on what format you want your API to output. It hints you about headers to use for most popular formats: JSON, XML, RSS and YAML.
3. An API endpoint in JSON format that gets information from a local CSV file and converts it into API.
4. Insufficient permissions when calling a protected API with a wrong username/password



== Changelog ==

= 1.1 =
* Add new default HTTP header "Access-Control-Allow-Origin: *"
* Add links to the Plugins screen for navigation convenience: "Settings" and "Support and community"
* Check if Twig Anything plugin is installed and active and show a warning if it is not

= 1.0 =
* The first release




== Upgrade Notice ==

= 1.1 =
This version adds a default HTTP Header that will allow ajax calls to your API Endpoints from domains other than your WordPress site. It also adds "Settings" and "Support" links to the plugins list for your convenience. This upgrade is not critical.