import React from 'react';

import { styles } from './styles';

import { OnlineUser } from '../../type/onlineUserType';

import {
  Pressable,
  View,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import {
  Text,
  Portal,
  Surface,
  Divider,
  Card,
  useTheme,
} from 'react-native-paper';


export default function OnlineUsers({
  visible,
  setVisible,
  onlineUsers,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onlineUsers: OnlineUser[];
}) {
  const theme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => {
          setVisible(false);
        }}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setVisible(false)}
        >
          <Pressable style={styles.sheetWrapper}>
            <Surface id="sheet" style={styles.sheet} elevation={1}>
              <View id="handle" style={styles.handle} />

              {/* TITLE */}
              <Text variant="titleLarge" style={{ marginBottom: 4, }}>
                Online Users
              </Text>

              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Browse list of all users that are online at this moment
              </Text>

              {/* <Divider style={{ marginVertical: 12, marginBlock: 24}} /> */}

              <FlatList
                style={{ flex: 1, marginTop: 12 }}
                contentContainerStyle={{
                  paddingBottom: 100
                }}
                data={onlineUsers}
                keyExtractor={(item) => item.id}
                renderItem={({ item: user, index }) => {

                  return (
                    <>
                      <Card
                        mode="elevated"
                        style={{
                          backgroundColor: 'transparent',
                          borderRadius: 0,
                        }}
                      >
                        <Card.Content style={{ paddingHorizontal: 0 }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <View key={user.id} style={[styles.avatar]}>
                                {user.avatarUrl && (
                                  <Image
                                    source={{
                                      uri: user.avatarUrl
                                    }}
                                    style={{ width: "100%", height: "100%", }}
                                  />
                                )}
                                <View style={styles.avatarsInitials}>
                                  <Text style={{ color: "#fff" }}>{(user.fullName ?? 'User').split(' ').slice(0, 2).map(str => str.charAt(0).toUpperCase()).join('')}</Text>
                                </View>
                              </View>
                              <View
                                style={{
                                  flexDirection: 'column',
                                }}
                              >
                                {/* Title */}
                                <Text
                                  variant="titleMedium"
                                  numberOfLines={2}
                                  style={{
                                    flex: 1,
                                    marginRight: 12,
                                    lineHeight: 24,
                                  }}
                                >
                                  {user.fullName}
                                </Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                  {user.email}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </Card.Content>
                      </Card>
                      <Divider />
                    </>
                  );
                }}
                ListEmptyComponent={
                  <View style={{
                    flex: 1,
                    padding: 8,
                    justifyContent: 'center',
                  }}>
                    <Text style={{ textAlign: 'center' }}>{'No users online'}</Text>
                  </View>
                }
              />
            </Surface>
          </Pressable>
        </Pressable>
      </Modal>
    </Portal>
  )
}