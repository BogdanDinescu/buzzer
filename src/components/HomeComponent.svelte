<script lang="ts">
    import { Paper, Text, Space, Title } from "@svelteuidev/core";
    import { onMount } from "svelte";
    import { gun, sea } from "../gunDB";
    import type { Post } from "../Post";
    import PostComponent from "./PostComponent.svelte";

    let followedUsers:{pub:string, alias:string}[] = [];
    let posts: Post[] = []

    onMount(() => {
        gun.user().get("following").map().once((alias, pub) => {
            if (alias !== null) {
                followedUsers.push({pub, alias});
            }
        });
        followedUsers.forEach((user, key, arr) => {
            gun.user(user.pub).get("posts").map().once(async (value) => {
                const post = JSON.parse(value.substring(3));
                const verifiedPost: Post = await sea.verify(value, post.m.pub);
                if (verifiedPost) {
                    posts.push(verifiedPost);
                } else {
                    const unverifiedPost = post.m;
                    unverifiedPost.signingError = true;
                    posts.push(unverifiedPost);
                }
                if (Object.is(arr.length - 1, key)) {
                    posts = posts.sort((a,b) => b.timestamp - a.timestamp);
                }
            });
        });
    });
</script>

{#each posts as post}
    <Space h={10}/>
    <PostComponent post = {post} signingError={"signingError" in post}/>   
{/each}
