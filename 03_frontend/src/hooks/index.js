// Re-export all context hooks from the context index
export {
    useAuth,
    useSymptoms,
    useMedications,
    useHealth,
    usePredictions,
    useResources,
    useSettings,
    useTheme,
    useNotification  // ✅ Fixed: useNotification (singular) not useNotifications
} from '../context';  // Single import from context index

// Custom hooks
export { useForm } from './useForm';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useMediaQuery } from './useMediaQuery';
export { default as useDebounce } from './useDebounce';
export { default as useFetch } from './useFetch';
export { default as useAsync } from './useAsync';
export { default as useToggle } from './useToggle';
export { default as useTimeout } from './useTimeout';
export { default as useInterval } from './useInterval';
export { default as usePrevious } from './usePrevious';
export { default as useOnClickOutside } from './useOnClickOutside';
export { default as useWindowSize } from './useWindowSize';
export { default as useScrollPosition } from './useScrollPosition';
export { default as useHover } from './useHover';
export { default as useClipboard } from './useClipboard';
export { default as useDocumentTitle } from './useDocumentTitle';
export { default as useOnlineStatus } from './useOnlineStatus';
export { default as usePagination } from './usePagination';
export { default as useInfiniteScroll } from './useInfiniteScroll';
export { default as useSearch } from './useSearch';
export { default as useFilter } from './useFilter';
export { default as useSort } from './useSort';