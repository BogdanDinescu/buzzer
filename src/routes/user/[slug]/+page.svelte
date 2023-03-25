<script lang="ts">
    import { gun, sea } from '../../../gunDB';
    import { page } from '$app/stores';
    import { Stack, Group, Title, Button, Loader, TextInput, Grid } from '@svelteuidev/core';
    import { onMount } from 'svelte';
    import type { Post } from '../../../Post';
    import PostComponent from '../../../components/PostComponent.svelte';
    import { afterNavigate, goto } from '$app/navigation';
    import { ArrowLeft } from 'radix-icons-svelte';

    let pub = $page.params.slug;
    let previousPage: any;
    let alias: string;
    let petname: string;
    let posts: Array<Post> = [];
    let following: boolean = false;
    let loadingFollow: boolean = false;

    onMount(() => {
        gun.user(pub).get("posts").map().once(async (value) => {
            const post = JSON.parse(value.substring(3));
            const verifiedPost: Post = await sea.verify(value, post.m.pub);
            if (verifiedPost) {
                posts = [...posts, verifiedPost];
            } else {
                const unverifiedPost = post.m;
                unverifiedPost.signingError = true;
                posts = [...posts, unverifiedPost];
            }
        });
        gun.user().get("following").map().once((aliasValue, pubKey) => {
            if (pubKey === pub && aliasValue !== null) {
                following = true;
                alias = aliasValue;
            }
        });
    })

    afterNavigate(({from}) => {
        previousPage = from?.url.pathname;
    })

    function follow() {
        loadingFollow = true;
        gun.user().get("following").get(pub).put(petname, (result) => {
            loadingFollow = false;
            following = true;
            alias = petname;
            if ("err" in result && result.err !== undefined) {
                console.log(result.err);
            }
        });
    }

    function unfollow() {
        loadingFollow = true;
        gun.user().get("following").get(pub).put(null, (result) => {
            loadingFollow = false;
            following = false;
            if ("err" in result && result.err !== undefined) {
                console.log(result.err);
            }
        });
    }

</script>

<Stack>
<Grid>
    <Grid.Col span={2}><Button color="orange" size="xs" on:click={() => goto(previousPage)}><ArrowLeft/></Button></Grid.Col>
    <Grid.Col span={8}><Title align="center">{alias}</Title></Grid.Col>
    <Grid.Col span={2}>
        {#if following}
            <Button ripple color="red" on:click={unfollow}>Unfollow {#if loadingFollow}<Loader variant='dots' color='white' size='sm'/>{/if}</Button>
        {:else}
            <Button ripple color="orange" on:click={follow}>Follow {#if loadingFollow}<Loader variant='dots' color='white' size='sm'/>{/if}</Button>
        {/if}
    </Grid.Col>
</Grid>
<TextInput
    placeholder="Name"
    bind:value={petname}
/>

<Group position="center" direction="column">
    {#each posts as post}
        <PostComponent post = {post} signingError={"signingError" in post}/>
    {/each}
</Group>
</Stack>