<script lang="ts">
    import { Button, Space, Switch} from '@svelteuidev/core';
    import { goto } from '$app/navigation';
    import { gun } from '../gunDB';
    import { onMount } from 'svelte';

    let darkTheme: boolean;

    onMount(() => {
        const themeStored = localStorage.getItem('theme');
        darkTheme = themeStored === 'dark';
    });

    function toggleTheme() {
        darkTheme = !darkTheme;
        localStorage.setItem("theme", darkTheme ? "dark" : "light");
        goto('/', {replaceState: true});
    }

    function logout() {
        gun.user().leave();
        localStorage.removeItem("encPrivKey");
        goto('/login', {replaceState: true});
    }
</script>


<Switch 
    on:change={toggleTheme} 
    checked={darkTheme}
    label = "Dark theme"
/>
<Space h={10}/>
<Button
    color="red" 
    uppercase
    on:click={logout}>
    Logout
</Button>