export interface ACL {
  [className: string]: string[] | {
    [id: string]: string[]
  }
}
