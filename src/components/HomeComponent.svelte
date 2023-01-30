<script lang="ts">
    import { Paper, Text, Space, Title } from "@svelteuidev/core";
    import { onMount } from "svelte";
    import { gun } from "../gunDB";

    let followedUsers:{pub:string, alias:string}[] = [];
    let posts: {pub: string, alias: string, timestamp: string, text: string}[] = []
    const cardStyle = {
        width: "500px"
    }

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
                        timestamp: id,
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
    <Paper
        p='sm'
        override={cardStyle}
    >
        <Title size='lg' weight="semibold">{post.alias}</Title>
        <Text size='xs' color='gray'>{post.pub}</Text>
        <Space h={10}/>
        <Text>{post.text}</Text>
        <Space h={10}/>
        <Text size='sm' color='gray'>{new Date(parseInt(post.timestamp)).toLocaleString()}</Text>
    </Paper>    
{/each}
