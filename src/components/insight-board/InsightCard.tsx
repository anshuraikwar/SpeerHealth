import Swipeable from 'react-native-gesture-handler/Swipeable';

import { priorityColors } from '../../styles/styles';

import { InsightType } from '../../type/InsightType';

import stages from '../../constants/stages';

import { getRelativeTime } from '../../utils/time-utils';

import {
  View,
} from 'react-native';
import {
  Card,
  Chip,
  Text,
  useTheme,
} from 'react-native-paper';

export default function InsightCard({
  insight,
  updateStage,
}: {
  insight: InsightType;
  updateStage: (insight: InsightType, nextStage: string) => Promise<void>;
}) {
  const theme = useTheme();

  const priority =
    priorityColors[insight.priority] ??
    priorityColors.P4;

  const currentIndex = stages.indexOf(insight.stage);

  const canMoveBackward = currentIndex > 0;

  const canMoveForward =
    currentIndex < stages.length - 1;

  const handleUpdateStage = async (
    direction: 'forward' | 'backward'
  ) => {
    try {
      const currentStage = insight.stage;
      const currentIndex =
        stages.indexOf(currentStage);

      let nextStage = currentStage;

      if (direction === 'forward') {
        if (
          currentIndex < stages.length - 1
        ) {
          nextStage = stages[currentIndex + 1];
        }
      } else {
        if (currentIndex > 0) {
          nextStage = stages[currentIndex - 1];
        }
      }

      if (nextStage === currentStage) {
        return;
      }

      await updateStage(insight, nextStage);
    } catch (error) {
      console.log(
        'Error while updating stage:',
        JSON.stringify(error, null, 2)
      );
    }
  };

  return (
    <Swipeable
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableOpen={(direction) => {
        if (direction === 'right' && canMoveBackward) {
          handleUpdateStage('backward');
        }

        if (direction === 'left' && canMoveForward) {
          handleUpdateStage('forward');
        }
      }
      }
      renderLeftActions={canMoveForward ? () => (
        <View
          style={{
            backgroundColor: '#4CAF50',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: '700',
            }}
          >
            Move Forward
          </Text>
        </View>
      ) : undefined}
      renderRightActions={canMoveBackward ? () => (
        <View
          style={{
            backgroundColor: '#EA580C',
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: '700',
            }}
          >
            Move Backward
          </Text>
        </View>
      ) : undefined}
    >
      <Card
        mode="elevated"
        style={{
          backgroundColor: '#000',
          borderRadius: 0,
        }}
      >
        <Card.Content>
          {/* Top Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
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
              {insight.title}
            </Text>

            {/* Priority Chip */}
            <Chip
              compact
              style={{
                backgroundColor: priority.container,
                borderRadius: 999,
              }}
              textStyle={{
                color: priority.text,
                fontWeight: '700',
                marginVertical: 2,
              }}
            >
              {insight.priority}
            </Chip>
          </View>

          {/* HCP Name */}
          {insight.hcp?.name && (
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
              }}
            >
              {insight.hcp.name}
            </Text>
          )}

          {/* Bottom Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 4,
              }}
            >
              {/* Category */}
              {insight.category && (
                <Chip
                  compact
                  style={{
                    backgroundColor: insight.category.color || theme.colors.secondaryContainer,
                    borderRadius: 999,
                  }}
                  textStyle={{
                    color: '#FFFFFF',
                    marginVertical: 2,
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  {insight.category.name}
                </Chip>
              )}
            </View>

            {/* Timestamp */}
            <Text
              variant="labelMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
              }}
            >
              {getRelativeTime(insight.updatedAt)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </Swipeable>
  );
}