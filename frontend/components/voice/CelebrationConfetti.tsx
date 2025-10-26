import React, { useEffect, useRef } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
}

interface CelebrationConfettiProps {
  onComplete?: () => void;
}

const CONFETTI_COLORS = [
  "#FFD700",
  "#FF6B9D",
  "#C589E8",
  "#4ECDC4",
  "#95E1D3",
  "#F38181",
  "#AA96DA",
  "#FCBAD3",
];

export const CelebrationConfetti: React.FC<CelebrationConfettiProps> = ({
  onComplete,
}) => {
  const confettiPieces = useRef<ConfettiPiece[]>([]);
  const [, forceUpdate] = React.useState(0);

  useEffect(() => {
    // Generate confetti pieces
    const pieces: ConfettiPiece[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const velocity = 5 + Math.random() * 10;
      pieces.push({
        id: i,
        x: centerX,
        y: centerY,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - 10,
      });
    }

    confettiPieces.current = pieces;
    forceUpdate(Date.now());

    // Animate confetti
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        onComplete?.();
        return;
      }

      confettiPieces.current = confettiPieces.current.map((piece) => {
        const gravity = 0.5;
        const newVelocityY = piece.velocityY + gravity;

        return {
          ...piece,
          x: piece.x + piece.velocityX,
          y: piece.y + newVelocityY,
          velocityY: newVelocityY,
          rotation: piece.rotation + 10,
        };
      });

      forceUpdate(Date.now());
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.current.map((piece) => (
        <View
          key={piece.id}
          style={[
            styles.confetti,
            {
              left: piece.x,
              top: piece.y,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              transform: [{ rotate: `${piece.rotation}deg` }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  confetti: {
    position: "absolute",
    borderRadius: 2,
  },
});
