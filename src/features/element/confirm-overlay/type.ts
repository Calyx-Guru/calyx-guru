export interface Properties {
  element: ElementName;
  onChooseAgain?: () => void;
  onConfirm?: (element: ElementName) => void;
}
