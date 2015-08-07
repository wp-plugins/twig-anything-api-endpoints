var TwigAnythingApiEndpointSettings = React.createClass({
    propTypes: {
        nonce: React.PropTypes.string.isRequired,
        wpHomeUrl: React.PropTypes.string.isRequired,
        defaultHeaders: React.PropTypes.arrayOf(
            React.PropTypes.object
        ).isRequired
    },
    getInitialState: function() {
        return {
            saving: false,
            saved: false,
            savingError: '',
            settings: {
                rewrite_endpoint_name: ''
            },
            endpoints: [],
            headers: []
        }
    },
    onApiEndpointNameChange: function(e) {
        this.setState({
            settings: {
                rewrite_endpoint_name: e.target.value
            }
        });
    },
    onSuccessTemplateChange: function(e) {
        this.setState({successTemplate: e.target.value});
    },
    onErrorTemplateChange: function(e) {
        this.setState({errorTemplate: e.target.value});
    },
    onAddHeaderClick: function() {
        var headers = this.state.headers;
        headers.push({
            header: ''
        });
        this.setState({headers: headers}, function() {
            var i = this.state.headers.length - 1;
            var node = React.findDOMNode(this.refs["header_input_"+i]);
            jQuery(node).focus();
        });
    },
    onAddEndpointClick: function() {
        var endpoints = this.state.endpoints;
        endpoints.push({
            api_slug: '',
            capability: '',
            twig_template_slug_or_id: ''
        });
        this.setState({endpoints: endpoints}, function() {
            var i = this.state.endpoints.length - 1;
            var node = React.findDOMNode(this.refs["endpoint_name_input_" + i]);
            jQuery(node).focus();
        });
    },
    onRemoveHeaderClick: function(i, e) {
        var headers = this.state.headers;
        headers.splice(i, 1);
        this.setState({headers: headers});
    },
    onHeaderChange: function(i, e) {
        var headers = this.state.headers;
        headers[i].header = e.target.value;
        this.setState({headers: headers});
    },
    onApiSlugChange: function(i, e) {
        var endpoints = this.state.endpoints;
        endpoints[i].api_slug = e.target.value;
        this.setState({endpoints: endpoints});
    },
    onTemplateSlugChange: function(i, e) {
        var endpoints = this.state.endpoints;
        endpoints[i].twig_template_slug_or_id = e.target.value;
        this.setState({endpoints: endpoints});
    },
    onCapabilityChange: function(i, e) {
        var endpoints = this.state.endpoints;
        endpoints[i].capability = e.target.value;
        this.setState({endpoints: endpoints});
    },
    onRemoveEndpointClick: function(i, e) {
        var endpoints = this.state.endpoints;
        endpoints.splice(i, 1);
        this.setState({endpoints: endpoints});
    },
    onSaveClick: function() {
        if (this.state.saving) {
            return;
        }
        this.setState({saving: true}, function() {
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
            jQuery.post(ajaxurl, data)
                .done(function() {
                    me.setState({saving: false, saved: true, savingError: ''});
                })
                .fail(function() {
                    me.setState({saving: false, saved: false, savingError: 'Error occurred! Please try again'});
                })
        });
    },
    render: function() {

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
            defaultHeadersDOM.push(
                <li key={"default_header_" + i}>
                    <code>{defaultHeader.header}</code>
                </li>
            );
        }

        var headersDOM = [];
        for (i = 0; i < this.state.headers.length; i++) {
            key = "header_" + i.toString();
            var inputRef = "header_input_" + i;
            headersDOM.push(
                <tr key = {key}>
                    <td>
                        {/* HEADER STRING */}
                        <input
                            ref         = {inputRef}
                            placeholder = "HTTP header"
                            type        = "text"
                            className   = "api-endpoint-header"
                            value       = {this.state.headers[i].header}
                            onChange    = {this.onHeaderChange.bind(this, i)}/>

                        {/* BUTTONS */}
                        <a className = "button button-secondary"
                           onClick  = {this.onRemoveHeaderClick.bind(this, i)}>
                            Remove
                        </a>
                    </td>
                </tr>
            );
        }

        var endpointsDom = [];
        for (i = 0; i < this.state.endpoints.length; i++) {
            var endpoint = this.state.endpoints[i];
            var slugInputRef = "endpoint_name_input_" + i;
            var apiUrl = this.props.wpHomeUrl
                + "/" + this.state.settings.rewrite_endpoint_name
                + "/" + endpoint.api_slug;
            endpointsDom.push(
                <tr key={"endpoint_" + i}>
                    <td>
                        {/* API SLUG */}
                        <input
                            ref         = {slugInputRef}
                            placeholder = "API slug"
                            type        = "text"
                            className   = "regular-text endpoint-slug"
                            value       = {endpoint.api_slug}
                            onChange    = {this.onApiSlugChange.bind(this, i)}/>
                        {/* ARROW */}
                        <span className="api-endpoint-arrow">=&gt;</span>

                        {/* TWIG TEMPLATE */}
                        <input
                            placeholder = "Twig Template slug or id"
                            type        = "text"
                            className   = "regular-text"
                            value       = {endpoint.twig_template_slug_or_id}
                            onChange    = {this.onTemplateSlugChange.bind(this, i)}/>

                        {/* CAPABILITY */}
                        <input
                            placeholder = "capability (public access if empty)"
                            type        = "text"
                            className   = "url-endpoint-capability"
                            value       = {endpoint.capability}
                            onChange    = {this.onCapabilityChange.bind(this, i)}/>

                        {/* BUTTONS */}
                        <a className = "button button-secondary"
                           href   = {apiUrl}
                           target = "twig_anything_api_endpoint_preview">
                            Open
                        </a>
                        <a className = "button button-secondary"
                           onClick  = {this.onRemoveEndpointClick.bind(this, i)}>
                            Remove
                        </a>
                    </td>
                </tr>
            );
        }

        var savingStatusDOM = null;
        if (this.state.saving) {
            savingStatusDOM = (
                <div className="updated notice-success">
                    <p>Saving...</p>
                </div>
            );
        }
        else if (this.state.saved) {
            var date = new Date();
            var datetime = date.getHours() + ":"
                + date.getMinutes() + ":"
                + date.getSeconds();
            savingStatusDOM = (
                <div className="updated notice-success">
                    <p>Settings saved at {datetime}</p>
                </div>
            );
        }
        else if (this.state.savingError !== '') {
            savingStatusDOM = (
                <div className="updated  notice-error">
                    <p>{this.state.savingError}</p>
                </div>
            );
        }

        return (
            <div>
                <h2>API Endpoints</h2>

                <table className="form-table api-endpoints">
                    <tbody>
                    {endpointsDom}
                    </tbody>
                </table>
                <p>
                    <a className="button button-secondary" onClick={this.onAddEndpointClick}>
                        Add API Endpoint
                    </a>
                </p>

                <h2>Settings</h2>

                <table className="form-table">
                <tbody>
                <tr>
                    <th scope="row">
                        <label htmlFor="twig_anything_api_endpoint_name">
                            URL path to the API
                        </label>
                    </th>
                    <td>
                        <input
                            id        = "twig_anything_api_endpoint_name"
                            type      = "text"
                            className = "regular-text"
                            value     = {this.state.settings.rewrite_endpoint_name}
                            onChange  = {this.onApiEndpointNameChange}/>
                        <p className="description">
                            An example of an API endpoint:<br/>
                            <strong className='api-url-example'>
                                {this.props.wpHomeUrl}/
                                <span className="endpoint-example-node api-url">
                                    {endPointName}
                                </span>
                                /
                                <span className="endpoint-example-node endpoint-slug">
                                    {apiSlugExample}
                                </span>
                            </strong>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="twig_anything_api_endpoint_success_template">Success Template</label>
                    </th>
                    <td>
                            <textarea id="twig_anything_api_endpoint_success_template"
                                      rows     = "4" className="large-text"
                                      value    = {this.state.successTemplate}
                                      onChange = {this.onSuccessTemplateChange}></textarea>
                        <p className = "description">
                            The template to use for&nbsp;
                            <strong>successful API results</strong>.&nbsp;
                            <code>{"{{result}}"}</code> macro is replaced by
                            the result of Twig Template rendering.
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="twig_anything_api_endpoint_error_template">Error Template</label>
                    </th>
                    <td>
                            <textarea id="twig_anything_api_endpoint_error_template"
                                      rows     = "4" className="large-text"
                                      value    = {this.state.errorTemplate}
                                      onChange = {this.onErrorTemplateChange}></textarea>
                        <p className = "description">
                            The template to use for <strong>API errors</strong>.
                            Available macros:
                        </p>
                        <ul>
                            <li>
                                <code>{"{{error_code}}"}</code> - a short error code,
                                for example <code>AUTHENTICATION_ERROR</code>
                            </li>
                            <li>
                                <code>{"{{error_message}}"}</code> - a detailed
                                error message that reported only to admins
                                or if `WP_DEBUG` constant is set to `1`.
                            </li>
                            <li>
                                <code>{"{{api_user_id}}"}</code> - the ID of the user
                                accessing API. `NULL` for anonymous API calls.
                                If username/password are not provided,
                                tries to use the currently authenticated user.
                            </li>
                        </ul>
                    </td>
                </tr>
                </tbody>
                </table>


                <h2>HTTP Headers</h2>

                <p>By default, only the following HTTP headers are set:</p>
                <ol>
                    {defaultHeadersDOM}
                </ol>
                <p>
                    Below you can add more headers.
                    Here are a few headers you might need to use
                    depending on your API output format:
                </p>
                <ul>
                    <li>
                        <strong>JSON:</strong>
                        &nbsp;
                        <code>Content-Type: application/json; charset=utf-8</code>
                    </li>
                    <li>
                        <strong>XML:</strong>
                        &nbsp;
                        <code>Content-Type: application/xml; charset=utf-8</code>
                    </li>
                    <li>
                        <strong>RSS:</strong>
                        &nbsp;
                        <code>Content-Type: application/rss+xml; charset=utf-8</code>
                    </li>
                    <li>
                        <strong>YAML:</strong>
                        &nbsp;
                        <code>Content-Type: text/x-yaml; charset=utf-8</code>
                    </li>
                </ul>

                <table className="form-table api-endpoint-headers">
                    <tbody>
                    {headersDOM}
                    </tbody>
                </table>
                <p>
                    <a className="button button-secondary" onClick={this.onAddHeaderClick}>
                        Add Header
                    </a>
                </p>
                <hr/>
                <p className="submit">
                    <input
                        id        = "twig-anything-api-endpoint-save"
                        type      = "submit"
                        value     = "Save Changes"
                        className = "button button-primary"
                        onClick   = {this.onSaveClick} />
                </p>
                {savingStatusDOM}
            </div>
        );
    }
});

jQuery(function() {
    // Initialized in PHP
    var input = twigAnythingApiEndpointSettingsInputData || {
            nonce: '',
            wpHomeUrl: '',
            defaultHeaders: [],
            reactSettings: {}
        };

    // Render DataSource metabox
    React.render(
        <TwigAnythingApiEndpointSettings
            nonce     = {input.nonce}
            wpHomeUrl = {input.wpHomeUrl}
            defaultHeaders = {input.defaultHeaders} />,
        document.getElementById('twig-anything-api-endpoints-react-container'),
        function () {
            var rootComponent = this;

            if (input.reactSettings) {
                rootComponent.setState(input.reactSettings, function() {
                    // after state is propagated, do nothing
                });
            }
        }
    );

    jQuery('#api-endpoints-react-container')
});