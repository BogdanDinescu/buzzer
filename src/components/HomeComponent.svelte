<script lang="ts">
    import { Space } from "@svelteuidev/core";
    import { onMount } from "svelte";
    import { gun, sea } from "../gunDB";
    import type { Post } from "../Post";
    import PostComponent from "./PostComponent.svelte";

    let posts: Post[] = []

    onMount(() => {
        gun.user().get("following").map().once((alias, pub) => {
            if (alias !== null) {
                gun.user(pub).get("posts").map().once(async (value) => {
                    const post = JSON.parse(value.substring(3));
                    const verifiedPost: Post = await sea.verify(value, post.m.pub);
                    if (verifiedPost) {
                        posts = pushAndSort(posts, verifiedPost);
                    } else {
                        const unverifiedPost = post.m;
                        unverifiedPost.signingError = true;
                        posts = pushAndSort(posts, unverifiedPost);
                    }
                });
            }
        });
    });

    function pushAndSort(arr: Array<Post>, post: Post) {
        arr.push(post);
        let i = arr.length - 1;
        let item = arr[i];
        while (i > 0 && item.timestamp > arr[i-1].timestamp) {
            arr[i] = arr[i-1];
            i -= 1;
        }
        arr[i] = item;
        return arr;
    }
</script>

{#each posts as post}
    <Space h={10}/>
    <PostComponent post = {post} signingError={"signingError" in post}/>   
{/each}
