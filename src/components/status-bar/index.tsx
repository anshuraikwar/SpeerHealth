import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { styles } from "./styles";

import { UserResponseType } from "../../type/userType";

import { supabase } from "../../lib/supabase";
import { useQuery } from "@apollo/client/react";

import { GET_USER } from "../../graphql/queries/getUser";

import { usePresence } from "../../hooks/usePresence";

import { Image } from 'react-native';
import { Text } from "react-native-paper";
import { Pressable, View } from "react-native";
import OnlineUsers from "./onlineUsers";

const NUMBER_OF_AVATARS = 3;
export default function StatusBar() {
  const insets = useSafeAreaInsets();
  const [onlineUsersBottomSheetVisible, setOnlineUsersBottomSheetVisible] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string>();
  useEffect(() => {
    const getCurrentUser = async () => {
      const currentUserId = await supabase.auth
        .getSession()
        .then(({ data }) => {
          return data.session?.user?.id;
        })
        .catch((error) => {
        });
      if (currentUserId) setCurrentUserId(currentUserId);
    }
    getCurrentUser();
  }, []);

  const { data } = useQuery<UserResponseType>(GET_USER, {
    variables: {
      id: currentUserId,
    },
  });

  const currentUser = data?.usersCollection?.edges?.[0]?.node;

  const { onlineUsers } = usePresence({
    id: currentUser?.id ?? '',
    email: currentUser?.email ?? '',
    fullName: currentUser?.fullName ?? '',
    avatarUrl: currentUser?.avatarUrl,
  });
  const uniqueUsers = Array.from(
    new Map(onlineUsers.map((u) => [u.fullName, u])).values()
  );
  const visibleUsers = uniqueUsers.slice(0, NUMBER_OF_AVATARS);
  const overflowCount = uniqueUsers.length - NUMBER_OF_AVATARS;
  const num = Math.min(NUMBER_OF_AVATARS, uniqueUsers.length) - (overflowCount > 0 ? 0 : 1);

  return (
    <>
      <View style={[{
        paddingTop: insets.top,
        backgroundColor: "#3F51B5",
      }, styles.wrapper]}>
        <View style={styles.container}>
          <View style={styles.statusBar}>
            <Text variant={"titleLarge"} style={{ color: "#fff" }}>Insight Board</Text>
          </View>
          <Pressable onPress={() => setOnlineUsersBottomSheetVisible(true)}>
            <View style={{ flexDirection: 'row', }}>
              {visibleUsers.map((user, index) => (
                <View key={user.id} style={[styles.avatar, {
                  left: index < num ? (num - index) * 12 : 0,
                }]}>
                  {user?.avatarUrl && (
                    <Image
                      source={{
                        uri: user?.avatarUrl
                      }}
                      style={{ width: "100%", height: "100%", }}
                    />
                  )}
                  <View style={styles.avatarsInitials}>
                    <Text style={{ color: "#fff" }}>{(user.fullName ?? 'User').split(' ').slice(0, 2).map(str => str.charAt(0).toUpperCase()).join('')}</Text>
                  </View>
                </View>
              ))}

              {overflowCount > 0 && (
                <View style={styles.avatar}>
                  <Text>+{overflowCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      </View>

      {onlineUsersBottomSheetVisible && (
        <OnlineUsers
          visible={onlineUsersBottomSheetVisible}
          setVisible={setOnlineUsersBottomSheetVisible}
          onlineUsers={uniqueUsers}
        />
      )}
    </>
  )
}