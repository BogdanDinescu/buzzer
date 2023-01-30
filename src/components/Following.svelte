<script lang="ts">
    import { onMount } from 'svelte';
    import { gun } from '../gunDB';
    import { Paper, Chip, Text, Grid, TextInput, Space, Group } from '@svelteuidev/core';

    let users:{pub:string, alias:string, follow: boolean}[] = [];
    let key: string = "";
    const cardStyle = {
        width: "500px"
    }

    onMount(() => {
        let userData = gun.user().is;
        if (userData !== undefined) {
            key = userData.pub;
            // get all users
            gun.get("users").map().once((alias, pub) => {
                users.push({pub, alias, follow: false});
            });

            // get followed users
            let followedUsers: any = {}
            gun.user().get("following").map().once((alias, pub) => {
                followedUsers[pub] = alias;
            });
            console.log(followedUsers);
            // set follow = true if the user is present in followed Users based on it's public key
            users.map(u => {
                let alias = followedUsers[u.pub]
                if (alias) {
                    u.alias = alias;
                    u.follow = true;
                } else {
                    u.follow = false;
                }
            });
            console.log(users);
            users = users;
        }
    });


</script>

{#each users as {pub, alias, follow}}
    <Paper
        p='sm'
        withBorder
        override={cardStyle}
    >
        <Group position="center">
            <TextInput
                placeholder="Name"
                bind:value={alias}
            />
            
            <Chip
                color="orange"
                bind:checked={follow}
                on:click={() => {
                    if (follow) {
                        gun.user().get("following").get(pub).put(null);
                    } else {
                        gun.user().get("following").get(pub).put(alias);
                    }
                }}
            >
                Follow
            </Chip>
        </Group>
        <Space h={20}/>
        <Text size='sm' color='gray'>
            {pub}
        </Text>
    </Paper>
{/each}
