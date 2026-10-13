export interface Article {
	id: string;
	title: string;
	description: string;
	text: string;
	userId: string;
	createdAt: string;
    genres: string[];
    likes: number;
}

export interface User {
	id: string;
	username: string;
	name: string;
	about: string;
	avatarUrl: string;
}

export interface Comment {
	id: string;
	createdAt: string;
	text: string;
	articleId: string;
	userId: string;
}
