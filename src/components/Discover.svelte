<script lang="ts">
    import { Button, Group, Loader, Space } from "@svelteuidev/core";
    import { train, predict } from "../recommendationSystem";
    import { gun, sea } from "../gunDB";
    import type { Post } from "../Post";
    import PostComponent from "./PostComponent.svelte";

    let loading: boolean = false;
    let posts: Array<Post> = [];

    async function generate() {
        loading = true;
        train();
        posts = [];
        gun.get("hashtags").map().map(async (value, key) => {
            const post = JSON.parse(value.substring(3));
            const verifiedPost: Post = await sea.verify(value, post.m.pub);
            const unverifiedPost = post.m;
            console.log(unverifiedPost.text)
            const score = predict(unverifiedPost.text).w[0];
            console.log(score);
            if (verifiedPost) {
                verifiedPost.score = score
                posts = pushAndSort(posts, verifiedPost);
            } else {
                unverifiedPost.signingError = true;
                unverifiedPost.score = score;
                posts = pushAndSort(posts, unverifiedPost);
            }
            loading = false;
        })
    }

    function pushAndSort(arr: Array<Post>, post: Post) {
        arr.push(post);
        let i = arr.length - 1;
        let item = arr[i];
        while (i > 0 && item.score > arr[i-1].score) {
            arr[i] = arr[i-1];
            i -= 1;
        }
        arr[i] = item;
        return arr;
    }

</script>
<Group direction="column">
    <Button
        color="orange"
        disabled={loading}
        on:click={generate}>
        Generate recomandations
        {#if loading} <Loader variant='dots' color="orange" size="sm"/> <Space h="md"/> {/if}
    </Button>
    <Group direction="column">
        {#each posts as post}
            <PostComponent post = {post} signingError={"signingError" in post}/>   
        {/each}
    </Group>
</Group>