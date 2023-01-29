<script lang="ts">
    import { Button } from '@svelteuidev/core';
    import { goto } from '$app/navigation';

    function logout() {
        goto('/login', {replaceState: true});
    }
</script>

<Button
    color="red" 
    uppercase
    on:click={logout}>
    Logout
</Button>