'use strict';

var TwigAnythingApiEndpointSettings = React.createClass({
    displayName: 'TwigAnythingApiEndpointSettings',

    propTypes: {
        nonce: React.PropTypes.string.isRequired,
        wpHomeUrl: React.PropTypes.string.isRequired,
        defaultHeaders: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    },
    getInitialState: function getInitialState() {
        return {
            saving: false,
            saved: false,
            savingError: '',
            settings: {
                rewrite_endpoint_name: ''
            },
            endpoints: [],
            headers: []
        };
    },
    onApiEndpointNameChange: function onApiEndpointNameChange(e) {
        this.setState({
            settings: {
                rewrite_endpoint_name: e.target.value
            }
        });
    },
    onSuccessTemplateChange: function onSuccessTemplateChange(e) {
        this.setState({ successTemplate: e.target.value });
    },
    onErrorTemplateChange: function onErrorTemplateChange(e) {
        this.setState({ errorTemplate: e.target.value });
    },
    onAddHeaderClick: function onAddHeaderClick() {
        var headers = this.state.headers;
        headers.push({
            header: ''
        });
        this.setState({ headers: headers }, function () {
            var i = this.state.headers.length - 1;
            var node = React.findDOMNode(this.refs['header_input_' + i]);
            jQuery(node).focus();
        });
    },
    onAddEndpointClick: function onAddEndpointClick() {
        var endpoints = this.state.endpoints;
        endpoints.push({
            api_slug: '',
            capability: '',
            twig_template_slug_or_id: ''
        });
        this.setState({ endpoints: endpoints }, function () {
            var i = this.state.endpoints.length - 1;
            var node = React.findDOMNode(this.refs['endpoint_name_input_' + i]);
            jQuery(node).focus();
        });
    },
    onRemoveHeaderClick: function onRemoveHeaderClick(i, e) {
        var headers = this.state.headers;
        headers.splice(i, 1);
        this.setState({ headers: headers });
    },
    onHeaderChange: function onHeaderChange(i, e) {
        var headers = this.state.headers;
        headers[i].header = e.target.value;
        this.setState({ headers: headers });
    },
    onApiSlugChange: function onApiSlugChange(i, e) {
        var endpoints = this.state.endpoints;
        endpoints[i].api_slug = e.target.value;
        this.setState({ endpoints: endpoints });
    },
    onTemplateSlugChange: function onTemplateSlugChange(i, e) {
        var endpoints = this.state.endpoints;
        endpoints[i].twig_template_slug_or_id = e.target.value;
        this.setState({ endpoints: endpoints });
    },
    onCapabilityChange: function onCapabilityChange(i, e) {
        var endpoints = this.state.endpoints;
        endpoints[i].capability = e.target.value;
        this.setState({ endpoints: endpoints });
    },
    onRemoveEndpointClick: function onRemoveEndpointClick(i, e) {
        var endpoints = this.state.endpoints;
        endpoints.splice(i, 1);
        this.setState({ endpoints: endpoints });
    },
    onSaveClick: function onSaveClick() {
        if (this.state.saving) {
            return;
        }
        this.setState({ saving: true }, function () {
            var me = this;
            // Since 2.8 ajaxurl is always defined in the admin header
            // and points to admin-ajax.php
            var data = {
                action: 'twig_anything_api_endpoint_save_settings',
                settings: this.state.settings,
                endpoints: this.state.endpoints,
                headers: this.state.headers,
                successTemplate: this.state.successTemplate,
                errorTemplate: this.state.errorTemplate
            };
            jQuery.post(ajaxurl, data).done(function () {
                me.setState({ saving: false, saved: true, savingError: '' });
            }).fail(function () {
                me.setState({ saving: false, saved: false, savingError: 'Error occurred! Please try again' });
            });
        });
    },
    render: function render() {

        var i, key;

        var endPointName = this.state.settings.rewrite_endpoint_name;
        if (jQuery.trim(endPointName) === '') {
            endPointName = '...';
        }

        var apiSlugExample = 'api-slug';
        if (this.state.endpoints.length > 0) {
            var firstEndpointSlug = jQuery.trim(this.state.endpoints[0].api_slug);
            if (firstEndpointSlug != '') {
                apiSlugExample = firstEndpointSlug;
            }
        }

        var defaultHeadersDOM = [];
        for (i = 0; i < this.props.defaultHeaders.length; i++) {
            var defaultHeader = this.props.defaultHeaders[i];
            defaultHeadersDOM.push(React.createElement(
                'li',
                { key: 'default_header_' + i },
                React.createElement(
                    'code',
                    null,
                    defaultHeader.header
                )
            ));
        }

        var headersDOM = [];
        for (i = 0; i < this.state.headers.length; i++) {
            key = 'header_' + i.toString();
            var inputRef = 'header_input_' + i;
            headersDOM.push(React.createElement(
                'tr',
                { key: key },
                React.createElement(
                    'td',
                    null,
                    React.createElement('input', {
                        ref: inputRef,
                        placeholder: 'HTTP header',
                        type: 'text',
                        className: 'api-endpoint-header',
                        value: this.state.headers[i].header,
                        onChange: this.onHeaderChange.bind(this, i) }),
                    React.createElement(
                        'a',
                        { className: 'button button-secondary',
                            onClick: this.onRemoveHeaderClick.bind(this, i) },
                        'Remove'
                    )
                )
            ));
        }

        var endpointsDom = [];
        for (i = 0; i < this.state.endpoints.length; i++) {
            var endpoint = this.state.endpoints[i];
            var slugInputRef = 'endpoint_name_input_' + i;
            var apiUrl = this.props.wpHomeUrl + '/' + this.state.settings.rewrite_endpoint_name + '/' + endpoint.api_slug;
            endpointsDom.push(React.createElement(
                'tr',
                { key: 'endpoint_' + i },
                React.createElement(
                    'td',
                    null,
                    React.createElement('input', {
                        ref: slugInputRef,
                        placeholder: 'API slug',
                        type: 'text',
                        className: 'regular-text endpoint-slug',
                        value: endpoint.api_slug,
                        onChange: this.onApiSlugChange.bind(this, i) }),
                    React.createElement(
                        'span',
                        { className: 'api-endpoint-arrow' },
                        '=>'
                    ),
                    React.createElement('input', {
                        placeholder: 'Twig Template slug or id',
                        type: 'text',
                        className: 'regular-text',
                        value: endpoint.twig_template_slug_or_id,
                        onChange: this.onTemplateSlugChange.bind(this, i) }),
                    React.createElement('input', {
                        placeholder: 'capability (public access if empty)',
                        type: 'text',
                        className: 'url-endpoint-capability',
                        value: endpoint.capability,
                        onChange: this.onCapabilityChange.bind(this, i) }),
                    React.createElement(
                        'a',
                        { className: 'button button-secondary',
                            href: apiUrl,
                            target: 'twig_anything_api_endpoint_preview' },
                        'Open'
                    ),
                    React.createElement(
                        'a',
                        { className: 'button button-secondary',
                            onClick: this.onRemoveEndpointClick.bind(this, i) },
                        'Remove'
                    )
                )
            ));
        }

        var savingStatusDOM = null;
        if (this.state.saving) {
            savingStatusDOM = React.createElement(
                'div',
                { className: 'updated notice-success' },
                React.createElement(
                    'p',
                    null,
                    'Saving...'
                )
            );
        } else if (this.state.saved) {
            var date = new Date();
            var datetime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            savingStatusDOM = React.createElement(
                'div',
                { className: 'updated notice-success' },
                React.createElement(
                    'p',
                    null,
                    'Settings saved at ',
                    datetime
                )
            );
        } else if (this.state.savingError !== '') {
            savingStatusDOM = React.createElement(
                'div',
                { className: 'updated  notice-error' },
                React.createElement(
                    'p',
                    null,
                    this.state.savingError
                )
            );
        }

        return React.createElement(
            'div',
            null,
            React.createElement(
                'h2',
                null,
                'API Endpoints'
            ),
            React.createElement(
                'table',
                { className: 'form-table api-endpoints' },
                React.createElement(
                    'tbody',
                    null,
                    endpointsDom
                )
            ),
            React.createElement(
                'p',
                null,
                React.createElement(
                    'a',
                    { className: 'button button-secondary', onClick: this.onAddEndpointClick },
                    'Add API Endpoint'
                )
            ),
            React.createElement(
                'h2',
                null,
                'Settings'
            ),
            React.createElement(
                'table',
                { className: 'form-table' },
                React.createElement(
                    'tbody',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            { scope: 'row' },
                            React.createElement(
                                'label',
                                { htmlFor: 'twig_anything_api_endpoint_name' },
                                'URL path to the API'
                            )
                        ),
                        React.createElement(
                            'td',
                            null,
                            React.createElement('input', {
                                id: 'twig_anything_api_endpoint_name',
                                type: 'text',
                                className: 'regular-text',
                                value: this.state.settings.rewrite_endpoint_name,
                                onChange: this.onApiEndpointNameChange }),
                            React.createElement(
                                'p',
                                { className: 'description' },
                                'An example of an API endpoint:',
                                React.createElement('br', null),
                                React.createElement(
                                    'strong',
                                    { className: 'api-url-example' },
                                    this.props.wpHomeUrl,
                                    '/',
                                    React.createElement(
                                        'span',
                                        { className: 'endpoint-example-node api-url' },
                                        endPointName
                                    ),
                                    '/',
                                    React.createElement(
                                        'span',
                                        { className: 'endpoint-example-node endpoint-slug' },
                                        apiSlugExample
                                    )
                                )
                            )
                        )
                    ),
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            { scope: 'row' },
                            React.createElement(
                                'label',
                                { 'for': 'twig_anything_api_endpoint_success_template' },
                                'Success Template'
                            )
                        ),
                        React.createElement(
                            'td',
                            null,
                            React.createElement('textarea', { id: 'twig_anything_api_endpoint_success_template',
                                rows: '4', className: 'large-text',
                                value: this.state.successTemplate,
                                onChange: this.onSuccessTemplateChange }),
                            React.createElement(
                                'p',
                                { className: 'description' },
                                'The template to use for ',
                                React.createElement(
                                    'strong',
                                    null,
                                    'successful API results'
                                ),
                                '. ',
                                React.createElement(
                                    'code',
                                    null,
                                    '{{result}}'
                                ),
                                ' macro is replaced by the result of Twig Template rendering.'
                            )
                        )
                    ),
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            { scope: 'row' },
                            React.createElement(
                                'label',
                                { 'for': 'twig_anything_api_endpoint_error_template' },
                                'Error Template'
                            )
                        ),
                        React.createElement(
                            'td',
                            null,
                            React.createElement('textarea', { id: 'twig_anything_api_endpoint_error_template',
                                rows: '4', className: 'large-text',
                                value: this.state.errorTemplate,
                                onChange: this.onErrorTemplateChange }),
                            React.createElement(
                                'p',
                                { className: 'description' },
                                'The template to use for ',
                                React.createElement(
                                    'strong',
                                    null,
                                    'API errors'
                                ),
                                '. Available macros:'
                            ),
                            React.createElement(
                                'ul',
                                null,
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'code',
                                        null,
                                        '{{error_code}}'
                                    ),
                                    ' - a short error code, for example ',
                                    React.createElement(
                                        'code',
                                        null,
                                        'AUTHENTICATION_ERROR'
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'code',
                                        null,
                                        '{{error_message}}'
                                    ),
                                    ' - a detailed error message that reported only to admins or if `WP_DEBUG` constant is set to `1`.'
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'code',
                                        null,
                                        '{{api_user_id}}'
                                    ),
                                    ' - the ID of the user accessing API. `NULL` for anonymous API calls. If username/password are not provided, tries to use the currently authenticated user.'
                                )
                            )
                        )
                    )
                )
            ),
            React.createElement(
                'h2',
                null,
                'HTTP Headers'
            ),
            React.createElement(
                'p',
                null,
                'By default, only the following HTTP headers are set:'
            ),
            React.createElement(
                'ol',
                null,
                defaultHeadersDOM
            ),
            React.createElement(
                'p',
                null,
                'Below you can add more headers. Here are a few headers you might need to use depending on your API output format:'
            ),
            React.createElement(
                'ul',
                null,
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        'strong',
                        null,
                        'JSON:'
                    ),
                    ' ',
                    React.createElement(
                        'code',
                        null,
                        'Content-Type: application/json; charset=utf-8'
                    )
                ),
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        'strong',
                        null,
                        'XML:'
                    ),
                    ' ',
                    React.createElement(
                        'code',
                        null,
                        'Content-Type: application/xml; charset=utf-8'
                    )
                ),
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        'strong',
                        null,
                        'RSS:'
                    ),
                    ' ',
                    React.createElement(
                        'code',
                        null,
                        'Content-Type: application/rss+xml; charset=utf-8'
                    )
                ),
                React.createElement(
                    'li',
                    null,
                    React.createElement(
                        'strong',
                        null,
                        'YAML:'
                    ),
                    ' ',
                    React.createElement(
                        'code',
                        null,
                        'Content-Type: text/x-yaml; charset=utf-8'
                    )
                )
            ),
            React.createElement(
                'table',
                { className: 'form-table api-endpoint-headers' },
                React.createElement(
                    'tbody',
                    null,
                    headersDOM
                )
            ),
            React.createElement(
                'p',
                null,
                React.createElement(
                    'a',
                    { className: 'button button-secondary', onClick: this.onAddHeaderClick },
                    'Add Header'
                )
            ),
            React.createElement('hr', null),
            React.createElement(
                'p',
                { className: 'submit' },
                React.createElement('input', {
                    id: 'twig-anything-api-endpoint-save',
                    type: 'submit',
                    value: 'Save Changes',
                    className: 'button button-primary',
                    onClick: this.onSaveClick })
            ),
            savingStatusDOM
        );
    }
});

jQuery(function () {
    // Initialized in PHP
    var input = twigAnythingApiEndpointSettingsInputData || {
        nonce: '',
        wpHomeUrl: '',
        defaultHeaders: [],
        reactSettings: {}
    };

    // Render DataSource metabox
    React.render(React.createElement(TwigAnythingApiEndpointSettings, {
        nonce: input.nonce,
        wpHomeUrl: input.wpHomeUrl,
        defaultHeaders: input.defaultHeaders }), document.getElementById('twig-anything-api-endpoints-react-container'), function () {
        var rootComponent = this;

        if (input.reactSettings) {
            rootComponent.setState(input.reactSettings, function () {});
        }
    });

    jQuery('#api-endpoints-react-container');
});
/* HEADER STRING */ /* BUTTONS */ /* API SLUG */ /* ARROW */ /* TWIG TEMPLATE */ /* CAPABILITY */ /* BUTTONS */
// after state is propagated, do nothing
