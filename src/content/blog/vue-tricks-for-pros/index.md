---
title: 'Vue with TypeScript'
description: 'Utilize TypeScript to the fullest with Vue.js.'
date: '2025-01-01'
---

Since its inception, Vue has lagged behind React in terms of TypeScript support. Although there has been many recent advancements, many of these newer features are not provided as defaults. With this article, I intend to save you some of the pain I've suffered while getting accustomed to Vue.

## Enable Type Checking in Templates

To type check templates properly, you need to enable a special compiler option for the Vue TypeScript plugin:

`tsconfig.json`

```json
{
  "vueCompilerOptions": {
    "strictTemplates": true
  }
}
```

Without this, TypeScript will not be able to check that your components are imported, that the types of the properties are correct, etc.

## HTML Attributes as Props

**NOTE**: This requires Vue >=3.5.0 or above.

Vue has a feature called "Fallthrough Attributes":

> A "fallthrough attribute" is an attribute or v-on event listener that is passed to a component, but is not explicitly declared in the receiving component's props or emits. Common examples of this include class, style, and id attributes.

This mean that if you have a component `MyButton.vue`:

```vue
<template>
  <button :style="{ padding: `${padding ?? 0}px` }"></button>
</template>
<script setup lang="ts">
export type MyButtonProps = {
  padding?: number
}

const props = defineProps<MyButtonProps>()
</script>
```

You can pass attributes to the root element of the component even though they are not declared in the `props`, nor explicitly bound in the template:

```vue
<template>
  <MyButton
    class="btn"
    id="my-button"
    :p="10"
  />
</template>
```

However, this will not operate well with `vueCompilerOptions.strictTemplates: true`, as TypeScript will complain that there is no `class` prop on `MyButton`.

The solution is to include all Button attributes in the `MyButtonProps` type with an intersection:

```vue
<script setup lang="ts">
import { type ButtonHTMLAttributes } from 'vue'

export type MyButtonProps = {
  padding?: number
} & /* @vue-ignore */ ButtonHTMLAttributes

const props = defineProps<MyButtonProps>()
```

The Vue compiler generates a `props` object based on the type argument of the `defineProps` _macro_. These exist at runtime, and since `ButtonHTMLAttributes` contains almost 200 properties, this object would become huge. The `@vue-ignore` directive tells the Vue compiler to skip the generation of `props`, so that `ButtonHTMLAttributes` will only be handled by TypeScript. See [this comment](https://github.com/vuejs/core/issues/11123#issuecomment-2168310426) from Evan You.

The next challenge is to bind these attributes to the component. Vue is in a sad state where there is no built-in tool for rest-destructuring, so we are forced to reach for external tooling—`@vueuse/core`:

```vue
<template>
  <button
    v-bind="rootProps"
    :style="{ padding: `${padding ?? 0}px` }"
  />
</template>
<script setup lang="ts">
import { type ButtonHTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'

export type MyButtonProps = {
  padding?: number
} & /* @vue-ignore */ ButtonHTMLAttributes

const props = defineProps<MyButtonProps>()

const rootProps = reactiveOmit(props, ['padding'])
</script>
```

`rootProps` will now have

It is essential that `v-bind` appears on the first line, or the `style` attribute above it will yield the following TypeScript error:

> Vue: style is specified more than once, so this usage will be overwritten.

This is erroneous, as the `style` property in the type of `rootProp` is optional.

If you followed all the steps above, you are now able to pass any button HTML attribute to `MyButton`, complete with TypeChecking:

```vue
<template>
  <MyButton
    class="btn"
    id="my-button"
    :p="10"
  />
</template>
```

When passing attributes that are used within the component, `v-bind` will take precedence and override the `button` attributes:

```vue
<template>
  <MyButton
    :p="10"
    style="padding: 20px"
  />
</template>
```

In the example above, the `padding` will be `20px`.
