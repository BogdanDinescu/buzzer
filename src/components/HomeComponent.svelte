<script lang="ts">
    import { Paper, Text, Space, Title } from "@svelteuidev/core";
    import { onMount } from "svelte";
    import { gun } from "../gunDB";
    import type { Post } from "../Post";
    import PostComponent from "./PostComponent.svelte";

    let followedUsers:{pub:string, alias:string}[] = [];
    let posts: Post[] = []

    onMount(() => {
        gun.user().get("following").map().once((alias, pub) => {
            followedUsers.push({pub, alias});
        });
        console.log(followedUsers)
        followedUsers.forEach((u) => {
            if (u.alias !== null) {
                console.log(u.alias);
                gun.user(u.pub).get("posts").map().once((text, id) => {
                    posts.push({
                        pub: u.pub,
                        alias: u.alias,
                        timestamp: parseInt(id),
                        text: text
                    })
                });
            }
        });
        console.log(posts);
        posts = posts;
    });
</script>

{#each posts as post}
    <Space h={10}/>
    <PostComponent post = {post}/>   
{/each}
