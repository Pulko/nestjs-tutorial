import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from '../src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let appPrisma: PrismaService;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true }),
    );

    await app.init();
    await app.listen(3333);

    appPrisma = app.get(PrismaService);
    pactum.request.setBaseUrl(
      'http://localhost:3333',
    );

    await appPrisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Sign Up', () => {
      it('Should throw if email is empty', async () => {
        const dto = {
          password: '123456',
        };

        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });

      it('Should throw if password is empty', async () => {
        const dto = {
          email: 'vzdbovich@gmail.com',
        };

        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(400);
      });

      it('Should Sign Up', async () => {
        const dto = {
          email: 'vzdbovich@gmail.com',
          password: '123456',
          firstName: 'Fedor',
        };

        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains('access_token');
      });
    });

    describe('Sign In', () => {
      it('Should throw if email is empty', async () => {
        const dto = {
          password: '123456',
        };

        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(400);
      });

      it('Should throw if password is empty', async () => {
        const dto = {
          email: 'vzdbovich@gmail.com',
        };

        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(400);
      });

      it('Should throw if password is incorrect', async () => {
        const dto = {
          email: 'vzdbovich@gmail.com',
          password: '12345',
        };

        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(403);
      });

      it('Should Sign In', async () => {
        const dto = {
          email: 'vzdbovich@gmail.com',
          password: '123456',
        };

        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('access_token')
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get Me', () => {
      it('Should get current user', async () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });

      it('Should throw if user is not authenticated', async () => {
        return pactum
          .spec()
          .get('/users/me')
          .expectStatus(401);
      });
    });

    describe('Edit User', () => {
      it('Should update user', async () => {
        const dto: EditUserDto = {
          email: 'vzdbovich@pulko.com',
          firstName: 'Pulko',
        };

        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });

      it('Should not update user without authorization', async () => {
        const dto: EditUserDto = {
          email: 'vzdbovich@gmail.com',
          firstName: 'Fedor',
        };

        return pactum
          .spec()
          .patch('/users')
          .withBody(dto)
          .expectStatus(401);
      });
    });
  });

  describe('Bookmarks', () => {
    const createDto = {
      title: 'Bookmark',
      description: 'Bookmark description',
      link: 'https://bookmark.com',
    };

    const anotherCreateDto = {
      title: 'Another Bookmark',
      description: 'Another bookmark description',
      link: 'https://another-bookmark.com',
    };

    describe('Throws without authorization', () => {
      it('Should get empty bookmarks', async () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .expectStatus(401);
      });
    });

    describe('Get empty Bookmarks', () => {
      it('Should get empty bookmarks', async () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });

      it('Throws without authorization', async () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .expectStatus(401);
      });
    });

    describe('Create Bookmark', () => {
      it('Should create bookmark', async () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(createDto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });

      it('Should create another bookmark', async () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(anotherCreateDto)
          .expectStatus(201)
          .stores('anotherBookmarkId', 'id');
      });

      it('Throws without authorization', async () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBody(createDto)
          .expectStatus(401);
      });
    });

    describe('Get Bookmarks', () => {
      it('Should get bookmarks', async () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains(createDto.title)
          .expectBodyContains(
            createDto.description,
          )
          .expectBodyContains(createDto.link)
          .expectBodyContains(
            anotherCreateDto.title,
          )
          .expectBodyContains(
            anotherCreateDto.description,
          )
          .expectBodyContains(
            anotherCreateDto.link,
          )
          .expectJsonLength(2);
      });

      it('Throws without authorization', async () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .expectStatus(401);
      });
    });

    describe('Get Bookmark By Id', () => {
      it('Should get bookmark by id', async () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(200)
          .expectBodyContains(createDto.title)
          .expectBodyContains(
            createDto.description,
          )
          .expectBodyContains(createDto.link);
      });

      it('Should get another bookmark by id', async () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{anotherBookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withPathParams(
            'id',
            '$S{anotherBookmarkId}',
          )
          .expectStatus(200)
          .expectBodyContains(
            anotherCreateDto.title,
          )
          .expectBodyContains(
            anotherCreateDto.description,
          )
          .expectBodyContains(
            anotherCreateDto.link,
          );
      });

      it('Throws without authorization', async () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(401);
      });
    });

    describe('Edit Bookmark by Id', () => {
      it('Should edit bookmark by id', async () => {
        return pactum
          .spec()
          .patch('/bookmarks/$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(anotherCreateDto)
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(200)
          .expectBodyContains(
            anotherCreateDto.title,
          )
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains(
            anotherCreateDto.description,
          )
          .expectBodyContains(
            anotherCreateDto.link,
          );
      });

      it('Should edit another bookmark by id', async () => {
        return pactum
          .spec()
          .patch(
            '/bookmarks/$S{anotherBookmarkId}',
          )
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withPathParams(
            'id',
            '$S{anotherBookmarkId}',
          )
          .withBody(createDto)
          .expectStatus(200)
          .expectBodyContains(createDto.title)
          .expectBodyContains(
            '$S{anotherBookmarkId}',
          )
          .expectBodyContains(
            createDto.description,
          )
          .expectBodyContains(createDto.link);
      });

      it('Throws without authorization', async () => {
        return pactum
          .spec()
          .patch('/bookmarks/$S{bookmarkId}')
          .withBody(anotherCreateDto)
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(401);
      });
    });

    describe('Delete Bookmark', () => {
      it('Should delete bookmark by id', async () => {
        return pactum
          .spec()
          .delete('/bookmarks/$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(204);
      });

      it('Should not get deleted bookmark by id', async () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withPathParams('id', '$S{bookmarkId}')
          .expectBody('')
          .expectStatus(200);
      });

      it('Throws without authorization', async () => {
        return pactum
          .spec()
          .delete('/bookmarks/$S{bookmarkId}')
          .expectStatus(401);
      });
    });
  });
});
