import React from 'react';
import { View } from 'react-native';
import { Chip, TextInput, Text } from 'react-native-paper';

const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];

export default function FilterBar({
  search,
  setSearch,
  selectedPriorities,
  setSelectedPriorities,
  onClear,
}: any) {
  const togglePriority = (p: string) => {
    if (selectedPriorities.includes(p)) {
      setSelectedPriorities(
        selectedPriorities.filter((x: string) => x !== p)
      );
    } else {
      setSelectedPriorities([...selectedPriorities, p]);
    }
  };

  return (
    <View style={{ paddingTop: 12, paddingBottom: 12, gap: 12 }}>
      {/* Search */}
      <TextInput
        mode="outlined"
        placeholder="Search title or description"
        value={search}
        onChangeText={setSearch}
        style={{
          borderRadius: 4,
          padding: 1,
          fontSize: 16,
          height: 32,
        }}
      />

      {/* Priority chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PRIORITIES.map((p) => (
          <Chip
            key={p}
            selected={selectedPriorities.includes(p)}
            onPress={() => togglePriority(p)}
            mode={selectedPriorities.includes(p) ? 'flat' : 'outlined'}
            style={{
              borderRadius: 999,
            }}
          >
            {p}
          </Chip>
        ))}
      </View>

      {/* Clear */}
      {(search.trim().length > 0 || selectedPriorities.length > 0) && (
        <Text
          onPress={onClear}
          style={{ color: '#3F51B5', fontWeight: '600' }}
        >
          Clear all
        </Text>
      )}
    </View>
  );
}