<script>
    import { Center, SvelteUIProvider } from '@svelteuidev/core';

    const padding = {
        padding: '10px'
    }
    
</script>

<SvelteUIProvider>
    <Center override={padding}>
        <slot/>
    </Center>
</SvelteUIProvider>
