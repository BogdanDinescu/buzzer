<script lang="ts">
    import { Button, Space } from '@svelteuidev/core';
    import Gun from 'gun/gun';
    import SEA from 'gun/sea';
    import { gun } from '../gunDB';

    let text: string = '';
    export let closeModal: any;

    async function post() {
        const index: number = Gun.state();
        gun.user().get("posts").get(index.toString()).put(text, (result) => {
            closeModal();
        });
    }

</script>

<textarea rows="5" maxlength="300" bind:value={text}></textarea>
<Space h="md"/>
<Button
    color="orange"
    on:click={post}
>
    Post
</Button>

<style>
    textarea {
        width: 100%;
        height: 200%;
    }
</style>