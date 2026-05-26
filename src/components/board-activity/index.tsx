import React, { useRef } from 'react';
import { NetworkStatus } from '@apollo/client';

import { styles } from './styles';

import { ActivityResponseType } from '../../type/ActivityType';

import { useQuery } from '@apollo/client/react';
import { LIST_INSIGHT_ACTIVITY } from '../../graphql/queries/listInsightActivity';

import {
  Pressable,
  View,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Portal,
  Surface,
  Divider,
  useTheme,
} from 'react-native-paper';
import { FlatList } from 'react-native-gesture-handler';
import ActivityCard from './activity-card';

export default function BoardActivity({
  visible,
  setVisible,
  onPress,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onPress: (insightId: string, insightStage: string) => void;
}) {
  const theme = useTheme();

  const {
    data,
    loading: loadingActivity,
    error: activityError,
    fetchMore: fetchMoreActivity,
    networkStatus,
  } = useQuery<ActivityResponseType>(LIST_INSIGHT_ACTIVITY, {
    variables: {
      first: 20,
      filter: {},
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const isInitialLoading =
    loadingActivity && networkStatus === NetworkStatus.loading;

  const isFetchingMore =
    networkStatus === NetworkStatus.fetchMore;

  const activities = data?.insightActivitiesCollection?.edges.map(item => item.node) ?? [];
  const pageInfo = data?.insightActivitiesCollection.pageInfo;
  const isFetchingMoreRef = useRef(false);

  const loadMore = async () => {
    if (
      isFetchingMoreRef.current ||
      !pageInfo?.hasNextPage
    ) {
      return;
    }

    isFetchingMoreRef.current = true;

    try {
      await fetchMoreActivity({
        variables: {
          cursor: pageInfo.endCursor,
          first: 20,
          filter: {},
        },

        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }

          return {
            insightActivitiesCollection: {
              ...fetchMoreResult.insightActivitiesCollection,

              edges: [
                ...previousResult.insightActivitiesCollection.edges,
                ...fetchMoreResult.insightActivitiesCollection.edges,
              ],
            },
          };
        },
      });
    } catch (err) {
      console.error('Pagination error:', err);
    }
  };

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

              <Text variant="titleLarge" style={{ marginBottom: 4 }}>
                Activity Board
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Timeline of activities occured across the board
              </Text>

              <Divider style={{ marginVertical: 12, }} />

              {/* ACTIVITY TIMELINE */}
              {activityError ? (
                <View style={{
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#F44336",
                  borderRadius: 4,
                  backgroundColor: "rgba(244, 67, 54, 0.1)"
                }}>
                  <Text>Encountered error while fetching activity list: {activityError?.message}</Text>
                </View>
              ) : (
                <FlatList
                  contentContainerStyle={{
                    paddingBottom: 24
                  }}
                  data={activities}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item, index }) => (
                    <ActivityCard activity={item} i={index} onPress={onPress} />
                  )}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    isFetchingMore ? (
                      <View style={{
                        flex: 1,
                        padding: 8,
                        justifyContent: 'center',
                      }}>
                        <ActivityIndicator />
                      </View>
                    ) : null
                  }
                  ListEmptyComponent={
                    <View style={{
                      flex: 1,
                      padding: 8,
                      justifyContent: 'center',
                    }}>
                      <Text style={{ textAlign: 'center' }}>{isInitialLoading ? 'Loading...' : 'No activity'}</Text>
                    </View>
                  }
                />
              )}
            </Surface>
          </Pressable>
        </Pressable>
      </Modal>
    </Portal>
  )
}
