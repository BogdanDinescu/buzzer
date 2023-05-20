<script lang="ts">
    import { onMount } from 'svelte';
    import { gun } from '../gunDB';
    import { Paper, Chip, Text, TextInput, Space, Group, UnstyledButton, Center } from '@svelteuidev/core';
    import { goto } from '$app/navigation';

    let followedUsers:{pub:string, alias:string}[] = [];
    const cardStyle = {
        width: "500px"
    }
    const textStyle = {
        overflowWrap: "break-word"
    }

    onMount(() => {
        gun.user().get("following").map().once((alias, pub) => {
            if (alias !== null) {
                followedUsers = [...followedUsers, {pub, alias}];
            }
        });
    });


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
                    on:click={() => {
                        gun.user().get("following").get(pub).put(null, () => {
                            followedUsers = followedUsers.filter(x => x.pub !== pub)
                        });
                    }}
                >
                    Unfollow
                </Chip>
            </Group>
            <Space h={10}/>
            <Text size='sm' color='gray' override={textStyle}>{pub}</Text>
        </Paper>
    {/each}
</Group>