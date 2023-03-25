<script lang="ts">
    import { gun, sea } from '../../../gunDB';
    import { page } from '$app/stores';
    import { Stack, Group, Title } from '@svelteuidev/core';
    import { onMount } from 'svelte';
    import type { Post } from '../../../Post';
    import PostComponent from '../../../components/PostComponent.svelte';

    let pub = $page.params.slug;
    let posts: Array<Post> = [];

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
        })
    })

</script>

<Stack>
<Title>User posts</Title>

<Group position="center" direction="column">
    {#each posts as post}
        <PostComponent post = {post} signingError={"signingError" in post}/>
    {/each}
</Group>
</Stack>