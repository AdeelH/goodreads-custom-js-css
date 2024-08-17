$(document).ready(function () {
    selectAll('img.gr-book__image--large').forEach(e => e.title = e.alt);

    merge_want_to_reads();

    // Select the node that will be observed for mutations
    var targetNode = document.querySelector('div.gr-newsfeed>div.u-clearBoth>div');

    // Options for the observer (which mutations to observe)
    var config = { childList: true };

    // Callback function to execute when mutations are observed
    var callback = function (mutationsList) {
        for (var mutation of mutationsList) {
            if (mutation.type == 'childList') {
                selectAll('img.gr-book__image--large').forEach(e => e.title = e.alt);
                merge_want_to_reads();
            }
        }
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

});

function selectAll(query, elem = document) {
    return Array.from(elem.querySelectorAll(query));
}

function get_posts() {
    let post_elements = selectAll(".gr-newsfeedItem");
    let posts = post_elements
        .map((post_elem, idx) => {
            header = selectAll(".gr-newsfeedItem__header", post_elem)[0];
            user = selectAll("a.gr-user__profileLink", header)[0].textContent;
            type = selectAll("span", header)[0].textContent;
            book_imgs = selectAll('img.gr-book__image--large', post_elem)
                .map(e => e.closest('a'));
            return {
                "idx": idx,
                "user": user,
                "type": type,
                "post_elem": post_elem,
                "book_imgs": book_imgs
            }

        });
    return posts;
}

function merge_want_to_reads() {
    let posts = get_posts();
    let unique_users = new Set(posts.map(post => post.user));
    let user_to_posts = {};
    unique_users.forEach(
        user => {
            user_to_posts[user] = posts.filter(post => post.user == user);
        });

    let user_to_toread_posts = {};
    unique_users.forEach(
        u => user_to_toread_posts[u] = user_to_posts[u].filter(p => p.type == "wants to read"));

    Object.values(user_to_toread_posts)
        .filter(toread_posts => toread_posts.length > 1)
        .forEach(
            posts => {
                let base_post = posts[0];
                let base_post_elem = base_post.post_elem;

                // remove extraneous information
                base_post_elem.querySelector('.gr-mediaBox .gr-book__title').hidden = true;
                base_post_elem.querySelector('.gr-mediaBox .gr-book__author').hidden = true;
                base_post_elem.querySelector('.gr-mediaBox .gr-book__additionalContent').hidden = true;
                let footer = base_post_elem.querySelector('.gr-newsfeedItem__footer');
                if (footer) {
                    footer.remove();
                }

                // for every want-to-read post other than the base want-to-read
                // post, add its book to the base post and then hide it
                let books_already_merged = new Set(base_post.book_imgs.map(img => img.href));
                let book_imgs_container = base_post_elem.querySelector('.gr-mediaBox');
                posts.slice(1).forEach(
                    post => {
                        post.book_imgs.forEach(
                            img => {
                                if (!books_already_merged.has(img.href)) {
                                    book_imgs_container.appendChild(img);
                                    books_already_merged.add(img.href);
                                }
                            });
                        post.post_elem.hidden = true;
                    });
            });
}
