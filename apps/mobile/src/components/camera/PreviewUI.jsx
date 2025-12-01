import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, Image as RNImage } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Check, X } from "lucide-react-native";
import { DraggableMeme } from "./DraggableMeme";
import { captureRef } from "react-native-view-shot";

const { width: screenWidth } = Dimensions.get("window");

export function PreviewUI({
  photoUri,
  cameraLayout,
  cameraSettings,
  appSettings,
  countdown,
  onRetake,
  onValidate,
  memeElements = [],
  selectedMeme,
  onSelectMeme,
  onUpdateMemePosition,
  onRemoveMeme,
  onHapticFeedback,
}) {
  const insets = useSafeAreaInsets();
  const { cameraTop, cameraWidth, cameraHeight } = cameraLayout;
  const previewRef = useRef(null);

  console.log("PreviewUI reçoit memeElements:", memeElements);

  const handleValidate = async () => {
    // Si des memes sont présents, capturer la vue composite
    if (memeElements && memeElements.length > 0) {
      try {
        console.log('📸 Capture de la vue avec memes...', {
          memesCount: memeElements.length,
          refCurrent: !!previewRef.current,
          memes: memeElements.map(m => ({ id: m.id, x: m.x, y: m.y, width: m.width, height: m.height, scale: m.scale }))
        });
        
        // Attendre un peu pour s'assurer que tout est rendu
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const uri = await captureRef(previewRef, {
          format: 'jpg',
          quality: 0.95,
          result: 'tmpfile',
        });
        console.log('✅ Vue capturée avec succès:', uri);
        // Passer l'URI de la capture à la validation
        onValidate(uri);
      } catch (error) {
        console.error('❌ Erreur lors de la capture:', error);
        console.error('Error message:', error.message);
        console.error('Stack:', error.stack);
        // En cas d'erreur, valider sans la capture mais avec les memes pour affichage overlay
        console.warn('⚠️ Fallback: validation sans capture composite');
        onValidate();
      }
    } else {
      // Pas de memes, validation normale
      console.log('ℹ️ Pas de memes, validation normale');
      onValidate();
    }
  };

  if (!photoUri) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#000",
        zIndex: 500,
      }}
    >
      {/* Vue de capture (invisible, utilisée uniquement pour capturer avec react-native-view-shot) */}
      <View
        ref={previewRef}
        collapsable={false}
        style={{
          position: "absolute",
          top: -10000, // Hors écran
          left: 0,
          width: cameraWidth,
          height: cameraHeight,
          backgroundColor: "#000",
        }}
      >
        <RNImage
          source={{ uri: photoUri }}
          style={{
            width: cameraWidth,
            height: cameraHeight,
            transform: [
              {
                scaleX:
                  cameraSettings.facing === "front"
                    ? appSettings.mirror
                      ? 1
                      : -1
                    : appSettings.mirror
                      ? -1
                      : 1,
              },
            ],
          }}
          resizeMode="stretch"
        />
        
        {/* Memes statiques pour la capture */}
        {memeElements.map((meme) => (
          <View
            key={meme.id}
            style={{
              position: "absolute",
              left: meme.x,
              top: meme.y,
              width: meme.width * (meme.scale || 1),
              height: meme.height * (meme.scale || 1),
            }}
          >
            <RNImage
              source={{ uri: meme.url }}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="contain"
            />
          </View>
        ))}
      </View>

      {/* Vue visible pour l'utilisateur */}
      <View
        style={{
          position: "absolute",
          top: cameraTop,
          left: (screenWidth - cameraWidth) / 2,
          width: cameraWidth,
          height: cameraHeight,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 3,
          borderColor: "rgba(255,255,255,0.3)",
          backgroundColor: "#000",
        }}
      >
        <Image
          source={{ uri: photoUri }}
          style={{
            width: "100%",
            height: "100%",
            transform: [
              {
                scaleX:
                  cameraSettings.facing === "front"
                    ? appSettings.mirror
                      ? 1
                      : -1
                    : appSettings.mirror
                      ? -1
                      : 1,
              },
            ],
          }}
          contentFit="fill"
          transition={200}
        />

        {/* Background touchable to deselect memes in preview */}
        <TouchableOpacity
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
          onPress={() => onSelectMeme(null)}
          activeOpacity={1}
        />

        {/* Interactive meme elements overlay */}
        {memeElements.map((meme) => (
          <DraggableMeme
            key={meme.id}
            meme={meme}
            isSelected={selectedMeme === meme.id}
            onSelect={onSelectMeme}
            onUpdatePosition={onUpdateMemePosition}
            onRemove={onRemoveMeme}
            onHapticFeedback={onHapticFeedback}
            cameraLayout={cameraLayout}
          />
        ))}
      </View>

      <View
        style={{
          position: "absolute",
          top: cameraTop - 60,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 28,
            fontFamily: "Inter_700Bold",
            textAlign: "center",
          }}
        >
          {countdown}
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            textAlign: "center",
            marginTop: 4,
          }}
        >
          Auto-validation
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 20,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 60,
        }}
      >
        <TouchableOpacity
          onPress={onRetake}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.3)",
          }}
          activeOpacity={0.7}
        >
          <X size={36} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleValidate}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
          activeOpacity={0.8}
        >
          <Check size={36} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
