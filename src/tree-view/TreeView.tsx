/**
 * A tree of nested items that open and close, e.g. folders, categories or a
 * clinic's sites and rooms.
 *
 *   <TreeView items={folders} onSelect={(node) => open(node)} />
 *   <TreeView items={permissions} checkable checked={granted} onCheckedChange={setGranted} />
 *
 * Arrow keys move through it (←→ close and open), typing jumps, Enter selects.
 *
 * - `items`: `{ value, label, icon, children, disabled }`; a node with
 *   `children` is a branch (an empty array still opens and closes)
 * - `selected`, `defaultSelected`; `onSelectedChange`: the selected values;
 *   `selectionMode`: 'single' (default) or 'multiple'. `onSelect(node)`: an
 *   item (not a branch) was chosen
 * - `expanded`, `defaultExpanded`; `onExpandedChange`: the open branches' values
 * - `checkable`: a checkbox on each (ticking a branch ticks its children);
 *   `checked`, `defaultChecked`; `onCheckedChange`: the ticked values
 * - `renderItem(node, { branch, expanded, selected, depth })`: a row's content
 * - `label`: the tree's name (shown above it, and for assistive tech)
 *
 * By hand, Ark's parts are here too: TreeView.Root, Tree, Branch,
 * BranchControl, BranchText, BranchIndicator, BranchContent, Item, ItemText,
 * NodeProvider, NodeCheckbox… with `createTreeCollection`.
 */
import { useMemo, type ReactNode } from 'react'
import { TreeView as Ark, createTreeCollection, useTreeViewNodeContext, type TreeViewSelectionChangeDetails } from '@ark-ui/react/tree-view'
import 'iconify-icon'
import { cx, on, partsOf, withParts, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './tree-view.css'

export type TreeItem = { value: string, label: ReactNode, icon?: string, children?: TreeItem[], disabled?: boolean, [key: string]: unknown }
type Part = ReturnType<typeof partsOf>
type Render = ((node: TreeItem, state: { branch: boolean, expanded: boolean, selected: boolean, depth: number }) => ReactNode) | undefined

export type TreeViewProps = Omit<Ark.RootProps<TreeItem>, 'collection' | 'onSelect' | 'selectedValue' | 'defaultSelectedValue'
  | 'onSelectionChange' | 'expandedValue' | 'defaultExpandedValue' | 'onExpandedChange' | 'checkedValue' | 'defaultCheckedValue' | 'onCheckedChange'> & {
  items: TreeItem[]
  selected?: string[]
  defaultSelected?: string[]
  onSelectedChange?: (values: string[]) => void
  onSelect?: (node: TreeItem) => void
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (values: string[]) => void
  checkable?: boolean
  checked?: string[]
  defaultChecked?: string[]
  onCheckedChange?: (values: string[]) => void
  renderItem?: Render
  label?: ReactNode
  classes?: Classes<'root' | 'label' | 'tree' | 'branch' | 'branchControl' | 'branchIndicator' | 'branchText' | 'branchContent'
    | 'indentGuide' | 'item' | 'itemText' | 'icon' | 'checkbox'>
}

function TreeViewShortcut({
  items, selected, defaultSelected, onSelectedChange, onSelect, expanded, defaultExpanded, onExpandedChange,
  checkable = false, checked, defaultChecked, onCheckedChange, renderItem, label = null, className, classes, ...rest
}: TreeViewProps) {
  const t = useMessages()
  const part = partsOf('tree-view', classes)
  const collection = useMemo(() => createTreeCollection<TreeItem>({
    nodeToValue: (node) => node.value,
    nodeToString: (node) => (typeof node.label === 'string' ? node.label : node.value),
    isNodeDisabled: (node) => !!node.disabled,
    rootNode: { value: 'ROOT', label: '', children: items },
  }), [items])

  return (
    <Ark.Root {...(t.zag.treeView && { translations: t.zag.treeView })} {...rest} {...part('root')} className={cx(className, classes?.root)} collection={collection}
      {...(selected !== undefined && { selectedValue: selected })} {...(defaultSelected && { defaultSelectedValue: defaultSelected })}
      {...(expanded !== undefined && { expandedValue: expanded })} {...(defaultExpanded && { defaultExpandedValue: defaultExpanded })}
      {...(checked !== undefined && { checkedValue: checked })} {...(defaultChecked && { defaultCheckedValue: defaultChecked })}
      {...((onSelectedChange || onSelect) && {
        onSelectionChange: (details: TreeViewSelectionChangeDetails) => {
          onSelectedChange?.(details.selectedValue)
          // A single item chosen (not a branch): onSelect gets it.
          // (The focused one, or the last chosen: Zag may not have moved focus yet.)
          const nodes = details.selectedNodes as TreeItem[]
          const node = nodes.find((n) => n.value === details.focusedValue) ?? nodes[nodes.length - 1]
          if (node && !node.children) onSelect?.(node)
        },
      })}
      {...on('onExpandedChange', onExpandedChange, (d: { expandedValue: string[] }) => d.expandedValue)}
      {...on('onCheckedChange', onCheckedChange, (d: { checkedValue: string[] }) => d.checkedValue)}>
      {label && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <Ark.Tree {...part('tree')}>
        {items.map((node, i) => <Node key={node.value} node={node} indexPath={[i]} part={part} checkable={checkable} renderItem={renderItem} />)}
      </Ark.Tree>
    </Ark.Root>
  )
}

function Node({ node, indexPath, part, checkable, renderItem }: { node: TreeItem, indexPath: number[], part: Part, checkable: boolean, renderItem: Render }) {
  return (
    <Ark.NodeProvider node={node} indexPath={indexPath}>
      {node.children
        ? <Ark.Branch {...part('branch')}>
            <Ark.BranchControl {...part('branch-control')}>
              <Ark.BranchIndicator {...part('branch-indicator')}><iconify-icon icon="lucide:chevron-right" /></Ark.BranchIndicator>
              <Row node={node} part={part} checkable={checkable} renderItem={renderItem} />
            </Ark.BranchControl>
            <Ark.BranchContent {...part('branch-content')}>
              <Ark.BranchIndentGuide {...part('indent-guide')} />
              {node.children.map((child, i) => (
                <Node key={child.value} node={child} indexPath={[...indexPath, i]} part={part} checkable={checkable} renderItem={renderItem} />
              ))}
            </Ark.BranchContent>
          </Ark.Branch>
        : <Ark.Item {...part('item')}>
            <Row node={node} part={part} checkable={checkable} renderItem={renderItem} />
          </Ark.Item>}
    </Ark.NodeProvider>
  )
}

// A row's checkbox, icon and text (or your render).
function Row({ node, part, checkable, renderItem }: { node: TreeItem, part: Part, checkable: boolean, renderItem: Render }) {
  const state = useTreeViewNodeContext()
  const branch = !!node.children
  const Text = branch ? Ark.BranchText : Ark.ItemText
  return <>
    {checkable && (
      <Ark.NodeCheckbox {...part('checkbox')} onClick={(e) => e.stopPropagation()}>
        <Ark.NodeCheckboxIndicator indeterminate={<iconify-icon icon="lucide:minus" />}><iconify-icon icon="lucide:check" /></Ark.NodeCheckboxIndicator>
      </Ark.NodeCheckbox>
    )}
    {renderItem
      ? <Text {...part(branch ? 'branch-text' : 'item-text')}>{renderItem(node, { branch, expanded: state.expanded, selected: state.selected, depth: state.depth })}</Text>
      : <>
          {(node.icon ?? branch) && (
            <iconify-icon {...part('icon')} aria-hidden="true"
              icon={node.icon ?? (state.expanded ? 'lucide:folder-open' : 'lucide:folder')} />
          )}
          <Text {...part(branch ? 'branch-text' : 'item-text')}>{node.label}</Text>
        </>}
  </>
}

export const TreeView = withParts(TreeViewShortcut, {
  Root: Ark.Root, RootProvider: Ark.RootProvider, Label: Ark.Label, Tree: Ark.Tree, Branch: Ark.Branch, BranchControl: Ark.BranchControl,
  BranchText: Ark.BranchText, BranchIndicator: Ark.BranchIndicator, BranchContent: Ark.BranchContent, BranchIndentGuide: Ark.BranchIndentGuide,
  BranchTrigger: Ark.BranchTrigger, Item: Ark.Item, ItemText: Ark.ItemText, ItemIndicator: Ark.ItemIndicator, NodeProvider: Ark.NodeProvider,
  NodeCheckbox: Ark.NodeCheckbox, NodeCheckboxIndicator: Ark.NodeCheckboxIndicator, Context: Ark.Context,
})
export { createTreeCollection }
