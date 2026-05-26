import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Chip, TextInput, Text, Button, IconButton } from 'react-native-paper';
import { PRIORITIES } from '../../../constants/priorities';
import { Ionicons } from '@expo/vector-icons';
import FiltersBottomSheet from './bottom-sheet';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { capitalize } from '../../../utils/string-utils';
import { CategoriesType } from '../../../type/categoriesType';
import { HCPType } from '../../../type/HCPType';
import { TagType } from '../../../type/tagType';

export default function FilterBar({
  search,
  setSearch,
  onClear,
  filters,
  setFilters,
}: {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  onClear: () => void;
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<{}>>;
}) {
  const [bottomSheetVisible, setBottomSheetVisisble] = useState<boolean>(false);

  const getValue = (value: string | CategoriesType | HCPType | TagType) => {
    return typeof value === "string" ? value : (Object.keys(value).includes('name')) ? value.name : ''
  }
  const removeFilter = (filter: string, value: string) => {
    const filtersClone = { ...filters };
    const currentFilterValue = filtersClone[filter];
    if (Array.isArray(currentFilterValue)) {
      filtersClone[filter] = currentFilterValue.filter((val) => getValue(val) !== getValue(value));
    } else {
      delete filtersClone[filter];
    }
    setFilters(filtersClone);
  }

  const getFilterChip = (filter: string, value: string) => (
    <Chip
      key={`${filter}-${value}`}
      compact
      closeIcon={(props) => (
        <MaterialCommunityIcons
          {...props}
          name="close"
          size={16} // Set your custom size here
        />
      )}
      onClose={() => { removeFilter(filter, value) }}
      mode={'outlined'}
      style={{
        borderRadius: 999,
        padding: 0,
      }}
      textStyle={{
        fontSize: 12,
        marginVertical: 1,
      }}
    >
      {capitalize(filter)}: {value}
    </Chip>
  )
  return (
    <>
      <View style={{ display: 'flex', paddingVertical: 12, gap: 12 }}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          {/* Search */}
          <TextInput
            mode="outlined"
            placeholder="Search title or description"
            value={search}
            onChangeText={setSearch}
            style={{
              flex: 1,
              borderRadius: 4,
              padding: 1,
              fontSize: 16,
              height: 32,
            }}
          />
          <IconButton
            mode="outlined"
            icon="filter"
            style={{
              margin: 0,
              height: 34,
              borderRadius: 4,
            }}
            onPress={() => { setBottomSheetVisisble(true) }}
          />
        </View>

        {Object.keys(filters).length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {Object.keys(filters).map((filter) => {
              const value = filters[filter];
              return (
                Array.isArray(value) ? (
                  value.map((filterValue) => (
                    getFilterChip(filter, getValue(filterValue))
                  ))
                ) : (
                  getFilterChip(filter, getValue(value))
                ))
            })}
          </View>
        )}
        {/* Clear */}
        {(search.trim().length > 0 || Object.keys(filters).length > 0) && (
          <Text
            onPress={onClear}
            style={{ color: '#3F51B5', fontWeight: '600' }}
          >
            Clear all
          </Text>
        )}
      </View>


      {/* CREATE INSIGHT */}
      {(bottomSheetVisible) && (
        <FiltersBottomSheet
          visible={bottomSheetVisible}
          setVisible={setBottomSheetVisisble}
          filters={filters}
          onApply={(filters) => {
            setFilters(filters);
            setBottomSheetVisisble(false);
          }}
          onClear={() => { onClear(); setBottomSheetVisisble(false); }}
        />
      )}
    </>
  );
}