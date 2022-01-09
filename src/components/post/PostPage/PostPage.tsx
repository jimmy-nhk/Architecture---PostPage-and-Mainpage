import { Container } from "@mui/material";
import React, { useEffect, useState } from "react";
import DefaultLayout from "../../generic/layout/DefaultLayout";
import BodySection from "./BodySection";
import HeaderSection from "./HeaderSection";
import HeroSection from "./HeroSection";
import axios, { AxiosResponse } from "axios";
import Comments from "../../comment/Comments";
import { useParams } from "react-router-dom";
import { TokenStorageService } from "../../../app/service/token-storage.service";
import { AppConstants } from "../../../app/common/app.constants";

interface ILikedUser {
  uid: number
}

interface IPost {
  pid: number;
  title: string;
  tagline: string;
  bodyText: string;
  category: string;
  directors: string;
  coverUrl: string;
  likedCount: number;
  viewCount: number;
  tags: string;
  likedUserList: ILikedUser[];
}

// const URL = "https://sead-back-postservice.herokuapp.com/" + "post/";
const URL = AppConstants.POST_URL + "getPost/id=";
type PostParam = {
  id: string;
};

const PostPage = () => {
  var postId = useParams();
  var { id } = postId;

  // var postIdInt = parseInt(postId)

  var post: IPost | undefined = undefined;
//   var userId: number | undefined = undefined;
  const [postTitle, setPostTitle] = useState("");
  const [postTagline, setPostTagline] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [postContributors, setPostContributors] = useState("");
  const [postCoverUrl, setPostCoverUrl] = useState("");
  const [postLikedCount, setPostLikedCount] = useState(0);
  const [postViewCount, setPostViewCount] = useState(0);
  const [postTags, setPostTags] = useState("");
  const [userId, setUserId] = useState(undefined);
  const [likedUserList, setLikedUserList] = useState<ILikedUser[]>([]);
  const [isLikedByUser, setIsLikedByUser] = useState(false);

  useEffect(() => {
    axios.get(URL + postId.id).then((response: AxiosResponse) => {
      post = response.data as IPost;
      // console.log("fetch post=", response.data);
      setPostTitle(post.title);
      setPostTagline(post.tagline);
      setPostBody(post.bodyText);
      setPostCategory(post.category);
      setPostContributors(post.directors);
      setPostCoverUrl(post.coverUrl);
      setPostLikedCount(post.likedCount);
      setPostViewCount(post.viewCount);
      setPostTags(post.tags);
      setLikedUserList(post.likedUserList)
    });

    // Get user id
    setUserId(new TokenStorageService().getUser().id);
  }, []);

  useEffect(() => {
    if (likedUserList?.some(x => x.uid === Number(userId))) 
      setIsLikedByUser(true)
    
    // likedUserList?.map((x) => {
    //   if (x.uid === Number(userId)) 
    //     setIsLikedByUser(true)
    // })
  }, [likedUserList])

  useEffect(() => {
    // console.log("isLikedByUser=", isLikedByUser)
    axios.get(URL + postId.id).then((response: AxiosResponse) => {
      post = response.data as IPost;
      setPostTitle(post.title);
      setPostTagline(post.tagline);
      setPostBody(post.bodyText);
      setPostCategory(post.category);
      setPostContributors(post.directors);
      setPostCoverUrl(post.coverUrl);
      setPostLikedCount(post.likedCount);
      setPostViewCount(post.viewCount);
      setPostTags(post.tags);

      setLikedUserList(post.likedUserList)
    });
  }, [isLikedByUser])

  return (
    <DefaultLayout style={{ backgroundColor: "white" }}>
      <>
        <HeroSection tagline={postTagline} coverUrl={postCoverUrl} />
        <Container maxWidth="lg" sx={{ margin: "100px auto" }}>
          <HeaderSection
            tags={postTags}
            title={postTitle}
            category={postCategory}
            contributors={postContributors}
            likedCount={postLikedCount}
            userId={userId}
            postId={id}
            isLikedByUser={isLikedByUser}
            setIsLikedByUser={setIsLikedByUser}
          />
          <BodySection bodyText={postBody} />
        </Container>
        <Comments
          currentUserId={new TokenStorageService().getUser().id}
          postId={id}
        />
      </>
    </DefaultLayout>
  );
};

export default PostPage;
