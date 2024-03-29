import { createSlice, nanoid, createEntityAdapter } from '@reduxjs/toolkit';
import { readTags } from './localStorage';

// types
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app';
import type { ColorType } from '@/data/colors';

export interface TagIncompleteType {
  name: string;
  color?: ColorType;
  id?: string;
}
export interface TagType extends TagIncompleteType {
  id: string;
}

// adapter
const tagsAdapter = createEntityAdapter<TagType>({
  selectId: (tag: TagType) => tag.id as string, // assert ids to be type string, since all ids are generated as strings by nanoid
});

// initial state
const preloadedState = readTags();
const initialState = preloadedState
  ? tagsAdapter.getInitialState(preloadedState)
  : tagsAdapter.getInitialState();

export const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    createTag: (state, action: PayloadAction<TagIncompleteType>) => {
      const incompleteTag = action.payload;
      const newTag = {
        ...incompleteTag,
        id: nanoid(),
      };
      tagsAdapter.addOne(state, newTag);
    },
    updateTag: (
      state,
      action: PayloadAction<{ id: string; data: TagIncompleteType }>
    ) => {
      const { id, data } = action.payload;
      tagsAdapter.updateOne(state, { id, changes: data });
    },
    deleteTag: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      tagsAdapter.removeOne(state, id);
    },
  },
});

// export action creators
export const { createTag, updateTag, deleteTag } = tagsSlice.actions;

// export reducer
export const { reducer } = tagsSlice;

// export selectors
export const selectTags = (state: RootState) => state.tags;

// explicitly declaring EntityId[] to be type string[] to avoid type errors in components that use this selector, since ids are generated by nanoid() and will always be strings
export const selectTagIds = (state: RootState) => state.tags.ids as string[];

export const selectTagById = (id?: string) => (state: RootState) =>
  typeof id === 'string' ? state.tags.entities[id] : undefined;
