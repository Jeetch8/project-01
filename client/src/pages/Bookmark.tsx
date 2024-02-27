import React, { useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { base_url } from "@/utils/base_url";
import Post from "@/Components/Home/Post";

const Bookmark = () => {
  const { dataRef, doFetch } = useFetch({
    url: base_url + "/bookmark",
    method: "GET",
    authorized: true,
  });
  const { doFetch: bookmarkPostFetch } = useFetch({
    url: base_url + "/bookmark/",
    authorized: true,
    method: "PATCH",
    onSuccess: () => {
      doFetch();
    },
  });

  const { doFetch: unBookmarkPostFetch } = useFetch({
    url: base_url + "/bookmark/",
    authorized: true,
    method: "DELETE",
    onSuccess: () => {
      doFetch();
    },
  });

  useEffect(() => {
    doFetch();
  }, []);

  return (
    <div className="min-w-[600px] border-r-[1px] border-zinc-700">
      {dataRef.current?.bookmarks?.length ? (
        dataRef.current?.bookmarks?.map((el) => {
          return (
            <Post
              key={el._id}
              post={el}
              unBookmarkPostFetch={unBookmarkPostFetch}
              bookmarkPostFetch={bookmarkPostFetch}
            />
          );
        })
      ) : (
        <h1 className="text-xl font-bold p-4">No Bookmarks</h1>
      )}
    </div>
  );
};

export default Bookmark;
