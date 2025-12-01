import React, { useMemo, useCallback } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Search } from "lucide-react-native";
import { Image } from "expo-image";
import { useMemeSearch } from "../../hooks/useMemeSearch";
import { useTranslation } from "../../hooks/useTranslation";

export const MemeSheet = React.forwardRef(({ onMemeSelect }, ref) => {
  const { searchQuery, setSearchQuery, searchResults, isSearching } = useMemeSearch();
  const { t } = useTranslation();
  const snapPoints = useMemo(() => ["75%"], []);
  const innerRef = React.useRef(null);
  
  // Exposer les méthodes via ref parent
  React.useImperativeHandle(ref, () => ({
    present: () => {
      console.log("🎬 MemeSheet.present() appelé");
      innerRef.current?.present();
      // Forcer le snap après un délai pour s'assurer qu'il s'ouvre bien
      setTimeout(() => {
        innerRef.current?.snapToIndex(0);
      }, 100);
    },
    dismiss: () => {
      console.log("🔚 MemeSheet.dismiss() appelé");
      innerRef.current?.dismiss();
    },
  }), []);
  
  // Backdrop personnalisé pour améliorer l'interaction
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const renderContent = () => {
    if (isSearching) {
      return <Text style={styles.infoText}>{t('searchingMemes')}</Text>;
    }
    if (searchQuery.trim() !== "" && searchResults.length === 0) {
      return <Text style={styles.infoText}>{t('noMemesFound')} "{searchQuery}"</Text>;
    }
    if (searchQuery.trim() === "") {
      return <Text style={styles.infoText}>{t('searchMemesToAdd')}</Text>;
    }
    return (
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          // Utiliser le format webp en priorité (plus léger)
          const memeUrl = item.file?.sm?.webp?.url || item.file?.sm?.png?.url;
          if (!memeUrl) return null;
          return (
            <TouchableOpacity
              onPress={() => onMemeSelect(memeUrl)}
              style={styles.memeItem}
            >
              <Image 
                source={{ uri: memeUrl }} 
                style={styles.memeImage} 
                contentFit="cover" 
                placeholder={item.blur_preview} 
                transition={200}
                cachePolicy="memory-disk"
              />
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  return (
    <BottomSheetModal
      ref={innerRef}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      index={0}
      enableDismissOnClose={true}
      enableOverDrag={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      style={{ zIndex: 99999 }}
      containerStyle={{ zIndex: 99999 }}
    >
      <BottomSheetView style={styles.sheetContainer}>
        <Text style={styles.title}>{t('addMemes')}</Text>
        <View style={styles.searchBarContainer}>
          <Search size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchMemes')}
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <View style={{ flex: 1 }}>{renderContent()}</View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBackground: { backgroundColor: "#1a1a1a" },
  handleIndicator: { backgroundColor: "rgba(255,255,255,0.3)" },
  sheetContainer: { flex: 1, padding: 20 },
  title: { color: "#fff", fontSize: 20, fontFamily: "Inter_600SemiBold", textAlign: "center", marginBottom: 20 },
  searchBarContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#2C2C2C", borderRadius: 25, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 12, color: "#fff", fontSize: 16, fontFamily: "Inter_400Regular" },
  infoText: { color: "rgba(255,255,255,0.6)", fontSize: 16, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 40 },
  memeItem: { flex: 1, aspectRatio: 1, margin: 6, borderRadius: 12, overflow: "hidden", backgroundColor: "#2C2C2C" },
  memeImage: { width: "100%", height: "100%" },
});
