import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Palette } from '@/constants/colors';

export interface CalendarStripProps {
  selectedDate: string; // ISO format 'YYYY-MM-DD'
  onSelectDate: (date: string) => void;
  tripStatusMap?: Record<string, 'CONFIRMED' | 'ABSENT' | 'PENDING' | 'NONE'>;
  daysCount?: number;
}

export function CalendarStrip({
  selectedDate,
  onSelectDate,
  tripStatusMap = {},
  daysCount = 14,
}: CalendarStripProps) {
  // Generate dates starting from today
  const dates = React.useMemo(() => {
    const list: Array<{
      iso: string;
      dayName: string;
      dayNumber: number;
      monthName: string;
      isToday: boolean;
    }> = [];

    const today = new Date();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const monthNames = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    for (let i = 0; i < daysCount; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const iso = `${year}-${month}-${day}`;

      list.push({
        iso,
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        monthName: monthNames[d.getMonth()],
        isToday: i === 0,
      });
    }

    return list;
  }, [daysCount]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((item) => {
          const isSelected = item.iso === selectedDate;
          const status = tripStatusMap[item.iso] || 'NONE';

          return (
            <TouchableOpacity
              key={item.iso}
              activeOpacity={0.7}
              onPress={() => onSelectDate(item.iso)}
              style={[
                styles.dayCard,
                isSelected && styles.dayCardSelected,
                item.isToday && !isSelected && styles.dayCardToday,
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected && styles.dayNameSelected,
                  item.isToday && !isSelected && styles.dayNameToday,
                ]}
              >
                {item.isToday ? 'Hoje' : item.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                {item.dayNumber}
              </Text>
              <Text
                style={[
                  styles.monthName,
                  isSelected && styles.monthNameSelected,
                ]}
              >
                {item.monthName}
              </Text>

              {/* Status indicator dot */}
              <View style={styles.dotContainer}>
                {status === 'CONFIRMED' ? (
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: isSelected ? Palette.white : Palette.success },
                    ]}
                  />
                ) : status === 'ABSENT' ? (
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: isSelected ? Palette.white : Palette.destructive },
                    ]}
                  />
                ) : status === 'PENDING' ? (
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: isSelected ? Palette.white : Palette.warning },
                    ]}
                  />
                ) : (
                  <View style={styles.dotEmpty} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  dayCard: {
    width: 62,
    height: 84,
    borderRadius: 14,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: Palette.slate200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  dayCardSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  dayCardToday: {
    borderColor: Palette.primary,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate500,
    textTransform: 'uppercase',
  },
  dayNameSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  dayNameToday: {
    color: Palette.primary,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginVertical: 2,
  },
  dayNumberSelected: {
    color: Palette.white,
  },
  monthName: {
    fontSize: 10,
    fontWeight: '500',
    color: Palette.slate400,
  },
  monthNameSelected: {
    color: 'rgba(255,255,255,0.75)',
  },
  dotContainer: {
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotEmpty: {
    width: 5,
    height: 5,
  },
});
