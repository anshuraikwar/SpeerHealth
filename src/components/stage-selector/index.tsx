import React, { useState } from 'react';

import { styles } from './styles';

import { InsightType } from '../../type/InsightType';

import {
  Pressable,
  View,
  Modal,
} from 'react-native';
import {
  Text,
  Portal,
  Surface,
  Button,
  Divider,
  Chip,
  useTheme,
} from 'react-native-paper';
import stages from '../../constants/stages';


export default function StageSelector({
  visible,
  setVisible,
  insight,
  updateStage,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  insight: InsightType;
  updateStage: (insight: InsightType, nextStage: string) => Promise<void>;
}) {
  const theme = useTheme();
  const [nextStage, setNextStage] = useState<string>(insight?.stage);

  const handleUpdateStage = async (
  ) => {
    try {
      await updateStage(insight, nextStage);
      setVisible(false);
    } catch (error) {
      console.log(
        'Error while updating stage:',
        JSON.stringify(error, null, 2)
      );
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

              {/* TITLE */}
              <Text variant="titleLarge" style={{ marginBottom: 4, }}>
                Stage Selector
              </Text>

              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {insight?.title}
              </Text>

              {/* <Divider style={{ marginVertical: 12, marginBlock: 24}} /> */}

              {/* STAGE */}
              <View style={{ marginTop: 40, gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'column' }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {stages.map((stage) => (
                      <Chip
                        key={stage}
                        selected={nextStage === stage}
                        onPress={() => setNextStage(stage)}
                        mode={nextStage === stage ? 'flat' : 'outlined'}
                        style={{
                          borderRadius: 999,
                        }}
                      >
                        {stage}
                      </Chip>
                    ))}
                  </View>
                </View>
              </View>


              {/* ACTIONS */}
              <View style={{ marginTop: 48, gap: 10, flexDirection: 'row' }}>
                <Button
                  mode="contained"
                  onPress={() => setVisible(false)}
                  style={{ width: '50%' }}
                >
                  Cancel
                </Button>

                <Button
                  mode="outlined"
                  onPress={handleUpdateStage}
                  style={{ width: '50%' }}
                >
                  Save
                </Button>
              </View>
            </Surface>
          </Pressable>
        </Pressable>
      </Modal>
    </Portal>
  )
}