import React, { useEffect } from "react";
import Post from "./Post";
import { useFetch } from "../../hooks/useFetch";
import { base_url } from "../../utils/base_url";

const Feed = ({ fetchHomeFeed, data }) => {
  const { doFetch: likePostFetch } = useFetch({
    url: base_url + "/post/like",
    authorized: true,
    method: "PATCH",
    onSuccess: (res) => {
      data.current.post.forEach((el) => {
        if (el._id === res.post._id) {
          el.liked = true;
          el.likes = res.post.likes;
        }
      });
    },
  });
  const { doFetch: unlikePostFetch } = useFetch({
    url: base_url + "/post/unlike",
    authorized: true,
    method: "PATCH",
    onSuccess: (res) => {
      data.current.post.forEach((el) => {
        if (el._id === res.post._id) {
          el.liked = false;
          el.likes = res.post.likes;
        }
      });
    },
  });
  const { doFetch: commentOnPostFetch } = useFetch({
    url: base_url + "/post/comment",
    authorized: true,
    method: "PUT",
    onSuccess: (res) => {
      data.current.post.forEach((el) => {
        if (el._id === res.post._id) {
          el.comments = res.post.comments;
        }
      });
    },
  });
  const { doFetch: bookmarkPostFetch } = useFetch({
    url: base_url + "/bookmark/",
    authorized: true,
    method: "PATCH",
    onSuccess: (res) => {
      data.current.post.forEach((el) => {
        if (el._id === res.postId) {
          el.bookmarked = true;
        }
      });
    },
  });

  const { doFetch: unBookmarkPostFetch } = useFetch({
    url: base_url + "/bookmark/",
    authorized: true,
    method: "DELETE",
    onSuccess: (res) => {
      console.log(res);
      data.current.post.forEach((el) => {
        if (el._id === res.postId) {
          el.bookmarked = false;
        }
      });
    },
  });

  useEffect(() => {
    fetchHomeFeed();
  }, []);

  return (
    <div>
      {data.current?.post?.length > 0 ? (
        data.current?.post?.map((post) => {
          return (
            <Post
              key={post._id}
              post={post}
              commentOnPostFetch={commentOnPostFetch}
              likePostFetch={likePostFetch}
              unlikePostFetch={unlikePostFetch}
              bookmarkPostFetch={bookmarkPostFetch}
              unBookmarkPostFetch={unBookmarkPostFetch}
            />
          );
        })
      ) : (
        <div className="text-center text-lg text-white mt-5">
          No posts to show
        </div>
      )}
    </div>
  );
};

export default Feed;
