import { setUserProfile } from "../redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetUserProfile = (username, forceUpdate) => {
  const dispatch = useDispatch();
  // const [userProfile, setUserProfile] = useState(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/${username}`,
          { withCredentials: true }
        );
        if (res.data) {
          if (res.data.data) {
            dispatch(setUserProfile(res.data.data));
          } else {
            dispatch(setUserProfile(res.data));
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserProfile();
  }, [username, forceUpdate]);
};
export default useGetUserProfile;
