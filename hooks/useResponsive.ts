import { useMemo } from 'react';
import Responsive from '../constants/Responsive';

export const useResponsive = () => {
  const deviceSize = Responsive.getDeviceSize();
  const isTablet = Responsive.isTablet;
  const isSmallDevice = Responsive.isSmallDevice;
  const isLargeDevice = Responsive.isLargeDevice;
  const isXLargeDevice = Responsive.isXLargeDevice;

  const responsiveValue = useMemo(() => Responsive.responsiveValue, []);
  const responsiveWidth = useMemo(() => Responsive.responsiveWidth, []);
  const responsiveHeight = useMemo(() => Responsive.responsiveHeight, []);
  const scaleFontSize = useMemo(() => Responsive.scaleFontSize, []);
  const scaleSize = useMemo(() => Responsive.scaleSize, []);

  const spacing = useMemo(() => Responsive.ResponsiveSpacing, []);
  const textSizes = useMemo(() => Responsive.TextSizes, []);
  const borderRadius = useMemo(() => Responsive.ResponsiveBorderRadius, []);
  const buttonSizes = useMemo(() => Responsive.ButtonSizes, []);
  const inputSizes = useMemo(() => Responsive.InputSizes, []);
  const cardSizes = useMemo(() => Responsive.CardSizes, []);
  const imageSizes = useMemo(() => Responsive.ImageSizes, []);

  const grid = useMemo(() => Responsive.Grid, []);
  const screenDimensions = useMemo(() => Responsive.ScreenDimensions, []);
  const safeArea = useMemo(() => Responsive.SafeArea, []);

  return {
    // Device detection
    deviceSize,
    isTablet,
    isSmallDevice,
    isLargeDevice,
    isXLargeDevice,
    
    // Responsive functions
    responsiveValue,
    responsiveWidth,
    responsiveHeight,
    scaleFontSize,
    scaleSize,
    
    // Predefined sizes
    spacing,
    textSizes,
    borderRadius,
    buttonSizes,
    inputSizes,
    cardSizes,
    imageSizes,
    
    // Layout utilities
    grid,
    screenDimensions,
    safeArea,
  };
};

export default useResponsive;
