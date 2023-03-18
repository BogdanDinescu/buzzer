<script lang="ts">
    import { Button } from '@svelteuidev/core';
    import { goto } from '$app/navigation';
    import { gun } from '../gunDB';

    function logout() {
        gun.user().leave();
        localStorage.removeItem("encPrivKey");
        goto('/login', {replaceState: true});
    }
</script>

<Button
    color="red" 
    uppercase
    on:click={logout}>
    Logout
</Button>