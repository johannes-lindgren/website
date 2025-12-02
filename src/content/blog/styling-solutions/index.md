---
title: 'Styling Solutions for Vue'
description: 'Explore various ways to style Vue applications and their trade-offs.'
date: '2025-06-17'
---

In this article, we will explore various ways to style Vue applications, and discuss the trade-offs between them.

## The style Attribute

Let us start by asking ourselves why we cannot simply use the `style` attribute:

```vue
<template>
  <div :style="{ backgroundColor: 'red' }" />
</template>
```

It has several benefits:

- It's **anonymous** you don't need to invent a class name. Naming is hard, and we save time by not having to come up with one.
- It's **co-located** with the element—you can see the styles right next to the element/component where they are being used.
- It's **isolated**—by not defining a class name, other parts of the application cannot easily globally query the element.
- It's dynamic—you can style the element with JavaScript.

If the styles get excessive, just extract it into a computed property:

```vue
<template>
  <div :style="buttonStyle" />
</template>
<script setup lang="ts">
const buttonStyle = {
  backgroundColor: 'red',
  padding: '10px',
  borderRadius: '5px',
}
</script>
```

Now, some will argue that this does not create a proper _separation of concern_, so the propert solution is to move the styles in a `.css` file. But consider the following code:

```vue
// Alternative A: style + JS variable
<template>
  <div :style="buttonStyle" />
</template>
<script>
const buttonStyle = {
  backgroundColor: 'red',
  padding: '10px',
  borderRadius: '5px',
}
</script>
```

```vue
// Alternative B: class + CSS selector
<template>
  <div class="button" />
</template>
<style>
.button {
  background-color: red;
  padding: 10px;
  border-radius: 5px;
}
</style>
```

In both scenarios, there is a one-to-one correspondence between the HTML element and the styling—we haven't abstracted anything.

However, there are some legitimate reasons to use CSS over style attributes:

- **Performanc**e—if you render the element many times, the contents in the style attribute will be repeated for each element, which can cause your website
- **Browser states**—while it's _possible_ to track browser states (`:focus`, `:hover`, etc.) by attaching event listeners to the HTML element and tracking the state, it is painful to say the least!

We need to look further for a solution that addresses these issues—let's see where it leads us!

## Global CSS

When computers arrived in the 1940's, all state was global. The computer program could access memory from any other point in the application. [Algol 58](https://en.wikipedia.org/wiki/ALGOL_58) introduced the concept of a _scope_ which meant that not all parts of the program could access state from all other parts. This significantly improved the clarity, scalability and quality of programs—so much so that today, software engineers in countless fields take this invention for granted.

JavaScript initially had function- and block scope, but it wasn't designed to be used in large-scale applications with multiple files, so it used to be common to pass global variables via the `window` object. Eventually though, JavaScript caught up and introduced modules (ESM), which is the defacto standard these days.

However, when it comes to styling, many web developers does not bat an eye at global styles.

CSS has better performance than the `style` attribute, but everything is global in scope. When you write a CSS selector, that query will be matched against every element in the entire application. When it comes to styling, it does not matter if you divided your JavaScript code into modules if your CSS selectors anyway are global.

### Global CSS: BEM

https://getbem.com/[BEM] is a naming convention for CSS classes that attempts to address some of these problems. But ultimately, it's just a naming convention in a context where all selectors and class names are global.

Compare BEM to a program where every variable is a global variable (such as COBOL, FORTAN, and Assembly languages): you can make such a program work by adhering to naming conventions, but you will suffer some consequences:

- The variable names get very long or unreadable because every name has to be unique.
- It requires strict programming guidelines and strong discipline amongst the developers. A team member who don't adhere to the guidelines can easily cause chaos in the code base.
- There is still no guarantee that the names are unique. In a large project, there can be several functions/components that share the same name. When you load code dynamically, the styles can change depending on which pages a user visit, and the order in which the pages are visited.

BEM helps us to avoid naming conflicts, it does by no means encapsulate our styles. Consider the following component with global styles:

```vue
<!-- Button.vue  -->
<template>
  <div class="button" />
</template>
<style>
.button {
  background-color: red;
}
</style>
```

Somebody can write a second component:

```vue
<template>
  <h1>Title</h1>
</template>
<style>
.button {
  color: blue;
}
</style>
```

Note that the second component does not even render the `Button.vue` component, but it does modify the button's style. We now have a situation where the styles for `Button.vue` is distributed across multiple files. While the JavaScript is encapsulated in the component, the styles are not. In what sense is this is a _component_ when the styles are not encapsulated?

The reason the above example is problematic is that it gets compiled to the following HTML:

```html
<html>
  <head>
    <style>
      .button {
        background-color: red;
      }
      .button {
        color: blue;
      }
    </style>
  </head>
</html>
```

By using global styles, we might just as well write all of our styles in a single global CSS file. This is the problem that CSS modules solves.

## Modular CSS

In its inception, JavaScript did not have a module system. Eventually, there emerged competing module systems: AMD, UMD, CommonJs, ESM, RequireJS, etc. A JavaScript module encapsulates logic, guaranteeing that nothing outside the module can ever reach inside the module.

Similarly, for CSS, there has emerged various module systems that solves the problem of the default global scope. In all these competing solutions, CSS class names are _generated_.

### CSS Modules

With CSS modules, class names are generated by the CSS preprocessor. This means you don't attach the class names yourself, but rather you attach a reference to the class name. The CSS preprocessor then generates a unique class name for you. For example, by writing the following code, using the `module` attribute on the `style` tag:

```vue
<template>
  <div :class="$style.root" />
</template>
<style module>
.root {
  background-color: red;
}
</style>
```

you will get the following HTML output:

```html
<html>
  <head>
    <style>
      .root_1d2e3f {
        background-color: red;
      }
    </style>
  </head>
  <body>
    <div class="root_1d2e3f" />
  </body>
</html>
```

The class name is generated based on a hash of the styles in the selector. This means that the class name is unique to the component, and it will not collide with other class names in the application. This means that if another component writes a global selector `.button`, it will not affect the button in this component:

```vue
<template>
  <div class="root" />
</template>
<style>
// Global selector!
.root {
  background-color: blue;
}
</style>
```

Since the first component was using CSS modules, nothing that the second component does will affect the first component. This is a _huge_ advantage over global CSS.

Another benefit is that we don't need to think about naming conventions for the class names—any name will do as we are guaranteed that each class name will be unique.

### CSS-in-JS: Styled components

There are still some things that can be improved over CSS modules:

- Although we don't need to come up with class names, we still need to come up with a name for the reference to the class name (available from `$style.root` in the previous example). This is boilerplate.
- We still need to write the `:class` attribute, which is also boilerplate.
- We cannot co-locate the styles with the component. We need to write the styles in a separate file, which makes it harder to understand the component as a whole. The style attribute has the benefit of being co-located with the component:

```vue
<template>
  <div :style="{ backgroundColor: 'red' }" />
</template>
```

is more concise than

```vue
<template>
  <div :class="$style.root" />
</template>
<style module>
.root {
  background-color: blue;
}
</style>
```

- We cannot easily pass state into the styles. For example, if we want to change the background color based on a prop, we need to write a computed property that returns the correct class name.

```vue
<template>
  <div
    :class="{
      [$style.root]: true,
      [$style.error]: props.color === 'error',
      [$style.warn]: props.color === 'warn',
      [$style.info]: props.color === 'info',
      [$style.success]: props.color === 'success',
    }"
  />
</template>
<script setup lang="ts">
const props = defineProps<{
  color: 'success' | 'info' | 'warn' | 'error'
}>()
</script>
<style module>
.error {
  background-color: red;
}
.warn {
  background-color: yellow;
}
.info {
  background-color: blue;
}
.success {
  background-color: green;
}
</style>
```

Imagine a world where we could write the following code:

```vue
<template>
  <Root />
</template>
<script setup lang="ts">
const props = defineProps<{
  color: 'success' | 'info' | 'warn' | 'error'
}>()

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  success: 'green',
}

const Root = styled.div`
  backgroundcolor: ${colors[props.color]};
`
</script>
```

This is the world of styled components. In this world, we don't need to write the `:class` attribute, we don't need to come up with a name for the reference to the class name, and we can co-locate the styles with the component. We can also pass state into the styles.

And you can write selectors; in this example, we have a hover effect on the button:

```js
const Root = styled.div`    backgroundColor: ${colors[props.color]}
    &:hover {
        backgroundColor: grey;
    }`
```

And you can also use object style notation, if you prefer that over template literals:

```js
const Root = styled.div({
  backgroundColor: colors[props.color],
  '&:hover': {
    color: 'lightgreen',
  },
})
```

The `styled` functions take the argument, hashes the content, generates a name based on the hash, and generates a CSS selector. If the cache contains the hash, the CSS selector is reused.

A drawback is that this adds some runtime overhead, since the styles are generated at runtime.

Note that with styled components, we don't need Sass, Less, or any other CSS preprocessor. We can define design tokens, mixins, and utility functions with plain JavaScript:

```js
// Design tokens
const colors = {
  primary: 'blue',
  secondary: 'green',
  tertiary: 'red',
}
// Utility functions
const transition = (property, duration) => `${property} ${duration} ease-in-out`
// Mixins
const h1 = {
  fontFamily: 'Arial',
  fontSize: '2rem',
  fontWeight: 'bold',
  fontSize: '2rem',
  color: colors.primary,
  transition: transition('color', '0.3s'),
}
```

## CSS-in-JS: Emotion

https://emotion.sh/docs/introduction[Emotion] is a CSS-in-JS library that is similar to styled components. It has `styled` functions that works similarly to styled components, but it also has a `css` function that can be used to create a CSS object that can be passed to the `style` attribute.

```vue
<template>
  <div
    :class="
      css`
        backgroundcolor: red;
      `
    "
  />
</template>
```

This looks almost like the style attribute, but the `css` function will actually return a unique class name.

So Emotion brings us back the ergonomics that the `style` attribute initially gave us, but with the added performance benefits that we initially sought out with CSS.

## Summary

In conclusion:

- The `style` attribute is ergonomic, but has performance penalties.
- CSS is performant, but has global scope which results in spaghetti code.
- BEM is a naming convention that helps to avoid naming conflicts, but does nothing to encapsulate styles.
- CSS modules solves the problem of global scope, but still requires boilerplate and does not co-locate the styles with the component.
- Styled components and Emotion brings us back the ergonomics that the `style` attribute initially gave us, but with the added performance benefits that we initially sought out with CSS. Though, it adds some runtime overhead, due to the CSS being generated at runtime.

```

```
