call plug#begin()

Plug 'scrooloose/nerdtree'

Plug 'nathanaelkane/vim-indent-guides'

Plug 'raimondi/delimitmate'

Plug 'tomasr/molokai'

Plug 'vim-scripts/SearchComplete'

call plug#end()

set number

set t_Co=256

colorscheme molokai

" Set Molokia Theme
let g:molokai_original = 1

" Set up indent Guides
set ts=4 sw=4 et
set background=dark

" Open NERD Tree if no files opened
autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 0 && !exists("s:std_in") | NERDTree | endif
" Ctrl+n to toggle Nerd Tree
map <C-n> :NERDTreeToggle<CR>
" Close VIM if NERD Tree is only window
autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif



