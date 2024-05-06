# Inside Main

**Note: `handlebars` used instead of `mustache` for better syntax highlighting

## Work Project

```handlebars
<hgroup>
    <h1>{{title}}</h1>
    <p>{{{summary}}}</p>
</hgroup>
{{content}}
<section class="row">
    {{#student_project}}
    {{#start_new_row}}
    <div class="divider col-12"></div>
    {{/start_new_row}}
    <article class="col card">
        <a href="{{link}}">
            <h4>{{name}}</h4>
            <img src="{{image}}" alt="alt">
        </a>
        <p>{{{summary}}}</p>
    </article>
    {{/student_project}}
</section>
```

## Projects Section

```handlebars
<hgroup>
    <h1>{{title}}</h1>
    <p>{{{summary}}}</p>
</hgroup>
<section class="row">
    {{#pages}}
    {{#start_new_row}}
    <div class="divider col-12"></div>
    {{/start_new_row}}
    <article class="col card">
        <a href="{{permalink}}">
            <h4>{{title}}</h4>
            {{#image}}<img src="{{image}}" alt="{{alt}}">{{/image}}
        </a>
        <p>{{{summary}}}</p>
    </article>
    {{/pages}}
</section>
```

## Projects Page

```handlebars
<hgroup>
    <h1>{{title}}</h1>
    <p>Link: <a href="{{project_link}}">{{project_link}}</a></p>
    <p>{{{summary}}}</p>
</hgroup>
<section class="row">
    {{#image}}
    <figure class="card col-3 no-border">
        <img src="{{image}}" alt="{{alt}}">
        {{#caption}}
        <figcaption>{{caption}}</figcaption>
        {{/caption}}
    </figure>
    {{/image}}
    {{#pictures}}
    <figure class="card col no-border">
        <img src="{{permalink}}" alt="{{alt}}">
        <figcaption>{{caption}}</figcaption>
    </figure>
    {{/pictures}}
</section>
{{content}}
```

## Portfolio

```handlebars
<hgroup>
    <h1>{{title}}</h1>
    {{#summary}}
    <p>{{{summary}}}</p>
    {{/summary}}
</hgroup>
<h2>Main Projects</h2>
<section class="row">
    {{#pages}}
    {{#start_new_row}}
    <div class="divider col-12"></div>
    {{/start_new_row}}
    <article class="card col no-border">
        {{#permalink}}
        <a href="{{permalink}}"></a>
        {{/permalink}}
        <h3>
            {{#project_link}}<a href="{{project_link}}">{{title}}</a>{{/project_link}}
            {{^project_link}}{{title}}{{/project_link}}
        </h3>
        {{#image}}
        {{#project_link}}<a href="{{project_link}}">{{/project_link}}
            <img src="{{image}}" alt="{{alt}}" class="outline-dark" />
            {{#project_link}}</a>{{/project_link}}
        {{/image}}
        {{#summary}}
        <p>{{& summary}}
            <br />
            {{#permalink}}<a href="{{permalink}}">Learn More...</a>{{/permalink}}
        </p>
        {{/summary}}
    </article>
    {{/pages}}
</section>
<h2>Additional Projects</h2>
{{#subsections}}
<section class="no-border">
    {{#permalink}}
    <a href="{{permalink}}">
        <h3>{{title}}</h3>
    </a>
    {{/permalink}}
    {{#image}}
    {{#project_link}}<a href="{{project_link}}">{{/project_link}}
        <img src="{{image}}" alt="{{alt}}">
        {{#project_link}}</a>{{/project_link}}
    {{/image}}
    {{#summary}}
    <p>{{& summary}}</p>
    {{/summary}}
    <section class="row">
        {{#pages}}
        {{#start_new_row}}
        <div class="divider col-12"></div>
        {{/start_new_row}}
        <section class="card col no-border">
            {{#permalink}}
            <a href="{{permalink}}"></a>
            {{/permalink}}
            <h4>
                {{#project_link}}<a href="{{project_link}}">{{title}}</a>{{/project_link}}
                {{^project_link}}{{title}}{{/project_link}}
            </h4>
            {{#image}}
            {{#project_link}}<a href="{{project_link}}">{{/project_link}}
                <img src="{{image}}" alt="{{alt}}" class="outline-dark" />
                {{#project_link}}</a>{{/project_link}}
            {{/image}}
            {{#summary}}
            <p>{{& summary}}
                <br />
                {{#permalink}}<a href="{{permalink}}">Learn More...</a>{{/permalink}}
            </p>
            {{/summary}}
        </section>
        {{/pages}}
    </section>
    {{#subsections}}
    <section class="card col no-border">
        {{#permalink}}
        <a href="{{permalink}}">
            <h3>{{title}}</h3>
        </a>
        {{/permalink}}
        {{#image}}
        {{#project_link}}<a href="{{project_link}}">{{/project_link}}
            <img src="{{image}}" alt="{{alt}}">
            {{#project_link}}</a>{{/project_link}}
        {{/image}}
        {{#summary}}
        <p>{{& summary}}</p>
        {{/summary}}
    </section>
    {{/subsections}}
</section>
{{/subsections}}
```
