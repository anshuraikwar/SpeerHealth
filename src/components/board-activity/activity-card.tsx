import { styles } from './styles';

import { Activity } from '../../type/ActivityType';

import { getRelativeTime } from '../../utils/time-utils';

import {
  Pressable,
  View,
} from 'react-native';
import {
  Text,
} from 'react-native-paper';

const TIMELINE_WIDTH = 8;
const TIMELINE_GAP = 8;
export default function ActivityCard({
  activity,
  i,
  onPress,
}: {
  activity: Activity;
  i: number;
  onPress: (insightId: string, insightStage: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(activity.insight.id, activity.insight.stage)}
    >
      <View style={{
        height: i > 0 ? 32 : 12,
        display: 'flex',
        flexDirection: 'row',
        gap: TIMELINE_GAP,
      }}>
        <View style={{
          width: TIMELINE_WIDTH,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <View
            style={{
              flex: 1,
              width: 1,
              backgroundColor: "rgb(73,69,79)",
            }}
          />
        </View>
      </View>
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        gap: TIMELINE_GAP,
      }}>
        <View style={{
          width: TIMELINE_WIDTH,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <View
            style={{
              flex: 1,
              width: 1,
              backgroundColor: "rgb(73,69,79)",
            }}
          />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: "rgb(73,69,79)",
            }}
          />
          <View
            style={{
              flex: 1,
              width: 1,
              backgroundColor: "rgb(73,69,79)",
            }}
          />
        </View>
        <View style={{ flex: 1, flexDirection: 'row', gap: 4, justifyContent: 'space-between' }}>
          <Text>{activity.insight.title}</Text>
          <Text variant='bodySmall' style={{ color: 'gray' }}>{getRelativeTime(activity.createdAt)}</Text>
        </View>
      </View>
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        gap: TIMELINE_GAP,
      }}>
        <View style={{
          width: TIMELINE_WIDTH,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <View
            style={{
              flex: 1,
              width: 1,
              backgroundColor: "rgb(73,69,79)",
            }}
          />
        </View>
        <View style={{
          flex: 1,
          flexDirection: 'column',
          gap: 8,
        }}>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            <Text>{activity.action}</Text>

            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 999,
                backgroundColor: "rgb(73,69,79)",
              }}
            />
            <Text>{activity.user.fullName}</Text>
          </View>
          <View style={{ display: 'flex', flexDirection: 'column' }}>
            <View style={styles.activityContainer}>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={styles.headerCell}>
                  Field Name
                </Text>

                <Text style={styles.headerCell}>
                  Old Value
                </Text>

                <Text style={styles.headerCell}>
                  New Value
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cell}>
                  {activity.fieldName || "-"}
                </Text>

                <Text style={styles.cell}>
                  {`"${activity.oldValue}"` || "-"}
                </Text>

                <Text style={styles.cell}>
                  {`"${activity.newValue}"` || "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  )
}