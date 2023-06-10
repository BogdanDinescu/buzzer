<script lang="ts">
    import { onMount } from 'svelte';
    import { gun, sea } from '../gunDB';
    import { Paper, Chip, Text, Space, Group, UnstyledButton, Center } from '@svelteuidev/core';
    import { goto } from '$app/navigation';

    let followedUsers:{pub:string, alias:string}[] = [];
    const cardStyle = {
        width: "500px"
    }
    const textStyle = {
        overflowWrap: "break-word"
    }

    onMount(() => {
        gun.user().get("following").once(async (value) => {
            followedUsers = await decrypt(value);
        });
    });

    async function unfollow(pub: string): Promise<void> {
        followedUsers = followedUsers.filter((x) => x.pub !== pub);
        const enc = await encrypt(JSON.stringify(followedUsers));
        gun.user().get("following").put(enc, (result) => {
            if ("err" in result && result.err !== undefined) {
                console.log(result.err);
            }
        });
    }

    async function encrypt(str: string): Promise<string> {
        const pairString = sessionStorage.getItem('pair')
        if (pairString) {
            const pair = JSON.parse(pairString);
            const encrypted = await sea.encrypt(str, pair);
            return encrypted;
        }
        return str;
    }

    async function decrypt(str: string): Promise<any> {
        if (str === null || str === undefined) {
            return [];
        }
        const pairString = sessionStorage.getItem('pair')
        if (pairString) {
            const pair = JSON.parse(pairString);
            const decrypted = await sea.decrypt(str, pair);
            return decrypted;
        }
        return str;
    }
    
</script>

<Group direction="column">
    {#each followedUsers as {pub, alias}}
        <Paper
            p='sm'
            withBorder
            override={cardStyle}
        >
            <Group position="apart">
                <UnstyledButton root="a" on:click={() => goto('/user/' + pub)}><Text weight={'bold'}>{alias}</Text></UnstyledButton>
                <Chip
                    color="orange"
                    on:click={() => { unfollow(pub) }}
                >
                    Unfollow
                </Chip>
            </Group>
            <Space h={10}/>
            <Text size='sm' color='gray' override={textStyle}>{pub}</Text>
        </Paper>
    {/each}
</Group>