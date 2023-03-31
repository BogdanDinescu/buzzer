<script>
// @ts-nocheck


    import { Center, SvelteUIProvider } from '@svelteuidev/core';
    import { onMount } from 'svelte';

    const padding = {
        padding: '10px'
    }
    let theme = 'light';

    onMount(() => {
        const themeStored = localStorage.getItem('theme');
        if (themeStored !== 'dark' && themeStored !== 'light') {
            theme = 'light';
        } else {
            theme = themeStored;
        }
    })


</script>

<SvelteUIProvider withGlobalStyles themeObserver={theme}>
    <Center override={padding}>
        <slot/>
    </Center>
</SvelteUIProvider>
