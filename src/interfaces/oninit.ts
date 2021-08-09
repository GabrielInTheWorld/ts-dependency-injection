export function hasOnInit(target: any): target is OnInit {
  return !!target.onInit;
}

export interface OnInit {
  onInit(): void;
}
