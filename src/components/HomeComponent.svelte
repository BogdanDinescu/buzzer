<script lang="ts">
    import { Group } from "@svelteuidev/core";
    import { onMount } from "svelte";
    import { gun, sea } from "../gunDB";
    import type { Post } from "../Post";
    import PostComponent from "./PostComponent.svelte";

    let posts: Post[] = []
    let followingArray: Array<any> = [];

    onMount(() => {
        gun.user().get("following").once(async (value) => {
            followingArray = await decrypt(value);
            followingArray.forEach(pair => {
                gun.user(pair.pub).get("posts").map().once(async (value) => {
                    const post = JSON.parse(value.substring(3));
                    const verifiedPost: Post = await sea.verify(value, post.m.pub);
                    verifiedPost.alias = pair.alias;
                    if (verifiedPost) {
                        posts = pushAndSort(posts, verifiedPost);
                    } else {
                        const unverifiedPost = post.m;
                        unverifiedPost.signingError = true;
                        posts = pushAndSort(posts, unverifiedPost);
                    }
                });
            });
        })
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
    {#each posts as post}
        <PostComponent post = {post} signingError={"signingError" in post}/>   
    {/each}
</Group>