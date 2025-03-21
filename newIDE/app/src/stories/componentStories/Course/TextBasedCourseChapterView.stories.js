// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import type { UnlockedTextBasedCourseChapter } from '../../../Utils/GDevelopServices/Asset';
import TextBasedCourseChapterView from '../../../Course/TextBasedCourseChapterView';

import paperDecorator from '../../PaperDecorator';

export default {
  title: 'Course/TextBasedCourseChapterView',
  component: TextBasedCourseChapterView,
  decorators: [paperDecorator],
};

const courseChapter3: UnlockedTextBasedCourseChapter = {
  id: 'letters',
  title: 'Working with letters',
  templates: [
    {
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/1e2a1abf-cdae-4960-a8b9-1aba8c020663/UI_Premium_Course_-_Chapter_3_-_Menu.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46627AGRJLL%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233353Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJGMEQCIDxGymdn8gxh7NT5ZuAJYhRKes9c02BmW0zAVfvI1cZsAiAl9Ofm3vH1ttlF9PNM1%2FenKb1Z%2B4XJjGacCzeWRwk7eSqIBAiw%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMcd%2FHXxvJFoHRn9PIKtwDbInqmvV7stHt%2BEtIkMLUJ%2FYKBOL81f0bm257g%2FGon5UMaPzDPe%2FxiGMSBP68EKrWNUMz8CQm0mgth1FZEjE85t2tuLf1TAYLy0HoSs3fmMVMh1s5sbn1X8ucEH4mKdIZof33oDxjxGQTDHNgeLOTedGJbojP9acb2KScOlRJ0uMjN1LUwb2DGeYFa7sZwMPKNv8jE%2FUCCHAwDT2Q1ca2D6my%2FI4WPDqJfNiX%2FZkMTV%2FxNHHYQ2FSbkLu4AfU%2B%2B32DlvWk2IkF2V%2BetnPkDiOeYm5bZf6MetXBVy323XIdQVfKZYZXV%2BZZVaGI84%2FRfnNByxbK1RX1XqJFUZq7iSGWHOwgLXAIfHluLyVWz3lxogXnypR10U%2FyQb8sKJQtdfRNP4ox0kMncUNvwydg1dYQURT1WbMlm4b6ngIJfHRzBQ48%2F8dEN0LH49aTKxj4u2%2BCFaL%2FH%2Bqgqs%2Fslb8nYNsk4Bu62DhjdF1uD06OcvcUHizhGLHkpNjrxlBXfQyim2LiaCu2Q77WBQSsX6GFDLpJNvx%2BzO5QMnpxlSHLurGzOFhggGO1YU2E1duv2%2F%2B8B7SQ0K1TeFbTgXAFbkyJTOxJNg0B1aaO9VVDCAXp13dXL5I%2BYgn%2Bt3CegV928Awwdb3vgY6pgERuBRuQggxSQKmcxwhhKmIDAPeWaMAjt8iNLjm0JYV7w936mRDUl%2F02UOWTfbUN5lgZbMJ96Jb9BFwjg21FbR2MZBTJHDAlbs4PkY7Tv%2FG83yAfqXST2oFaFMqvYMIWr17pBqCGE9e7lcY0ZXADt50%2FuMDWbgpqs%2FCU%2BeSXQPUdYYTy50ZHImUHgixI1lOC1%2FMfCEvg6CtPkXzUTqYL31vY0ZhNzgF&X-Amz-Signature=7f6b290c6f8b344fdbf157d758335a700b2e686d5253edb373783a6562732420&X-Amz-SignedHeaders=host&x-id=GetObject',
      title: 'Task 1',
    },
  ],
  items: [
    {
      type: 'text',
      text:
        'A big part of UI interfaces depend on letters, so choosing the proper style to prioritize game identity and good readability is key to help the user navigate the game.',
    },
    {
      type: 'text',
      text:
        'To do so, the first thing to do is to find a style that matches the “vibe” of your game. The best way to do it is by using “Classifications”, each of them is commonly used to represent something specific. These are the most important ones and their uses:',
    },
    {
      type: 'text',
      text:
        '- ***Serifs*** are used for traditional, old school, “official” texts. Their name comes from the little “roller skates” (marked in red) that they have at the base of their lines. Use them for “professional” and “official” contexts: a game about an accountant trying to find lost receipts, Lab Researchers fighting over research publications, or Governments administrating a village’s resources.',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/3f5a45eb-dab2-40bb-a7fd-24ee1f0349f3/Serifs.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466SUTKLAFE%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233355Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJIMEYCIQCbgAdJ7Lyjx0Mx%2FylcmLEiPD6Ykn%2Bcx6wHJncof4HcRwIhAL3Xmvu35PDL5sqogC5Q0gl2mJ9W7CPBsQIp7wcyOS8qKogECLD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgxJzTHLuuzjxPlX%2Bf8q3APuUoiuMLLo3rlgEoEn60wGFLwT4IaxBpeclxQFPxry8XGnL8cQVM87q9pVuK%2FcF38p5DcvZCfzPwFw4OPsswNysWYC6YZLnYbqPgad%2BMhC39xpz9hhGIJdFrSRZMn2OS2cCC7I9fVqe2jRsovzdG69NnD4hVZTJsEcpEb%2BkLouNOTDkiuF2iy%2F7Q4GnNtAyozoYSDpkuf7Pksp6nBLgrfTzyXFkXWwk8UsPkn1jHqv%2Fo9yVPaj4ZC7TnAXG07Yp7fFQ14oKEwV1ZepSWmNx%2BgcfyxbeKLMA2HQGeD8wRvZZWN20FzdE0ieQ3BdQAFwYy7HzOE5hw8UQsHnYfPOJPDlXh1%2FxyyaGfp6Ea1wmziBvnk5nodScol6ARKSQvQ2TBXJsYzrbup5zcIKZ2F4cl%2BTo0tzv6dlULgZKiir2GyMzsthopsKAAcgiNN5FIv0g7xOTVxXyKx2Ozk2aIHScN0kovOmGBIpk1m22qKYkAAjUH7II01EtJdG7yIPQQ6VyvOaLrjDg21xj9u71ggBH60y7df8luNXKlousHb9ZkoSXLCUSmN%2B4Z6uPN6RLI8CmF9sRIv5wVOyruX7JE0kFRloNbv%2F75HwEqmjfoclLL3Ie0pHI03KG264VqUiizCM1ve%2BBjqkAdGMiIaSGeqhwABvo66Co9VUZOufH0FAdSaBNrZLK970y%2Br5BP2djxCUgfbSQtdMW1JmlcieSXEuh0C8x4jDM3p1%2Bvj7a0W4xN%2BoGyFRGjILQULjMPZfTY1XE7IY%2BsDt4dkp9NwmxeYgyXR3tm2md4z%2F1eW7wtaZZdsB6xSDCg8zW8f7joIJ5wnYCm%2F8xiwfstdPYENqsxxkgXrkJR2HjmL0Xcgz&X-Amz-Signature=af55da908ea2b3e497174516cd08ccd690b7a58092d0361ffd6d9913eccfc727&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
    {
      type: 'text',
      text:
        '- If you remove the “roller skates” from Serifs, you get a “***Sans Serif****”* which are commonly used for modern, contemporary vibes. This is a style that is the easier to read and that fits all purposes.',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/bd7a1e4b-7c15-40bc-8f6e-c5918a8aa59c/Sans.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667V2KWPN3%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233355Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJHMEUCIC5WEigRhVtgBEYs84OLNRB2YyXtI0y6tULykzO83s0JAiEAtF%2BYFmPoMwYd4iVKeGMgg4yiIoe8Oa7kY4q6WBR2KdUqiAQIsP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDBMrHZWnAbi2dnYCKyrcA93MliVxn9uJ8j4UkhmEc3aqJuOfKEx0du22m3QSFThFdfDnlc9iU8tLnx2Xqoej9RsyAZcEb9hqUCRt4zU2xPRsrENP1cIjcZIn8kpjCek7eHgH0DhSAA%2Fu6q31BxGGXTb3BVgAL5rbvKxmAe1VzZrQ6neTZds8Qj%2BC%2Bee%2BAdw6lxdVnCvC8t4GqB6z6y%2BSuMlXz2CVe%2B1cmCJPxh51H6usmcCMi%2F2uI4yVGyfnD77je1fDh5hvoARrzI70psE6b5IBA57hV45m6dlNt5iwZEY8ZNgOJTHfX6hBoyQJRVt2OVwNeVmx06vOJJI%2FdaFjlyl3W%2BY%2FJH9fUZnmvDk4A%2BLO8JmobgLyuk3dQnYgv4gMgR7XqeO4d8bIPB2OrO7tR%2BbteARpLX5WXFdsPM2ZGQM1n93ttSaSWXz0EyAybc9FlRn%2BSaKhM4b6xk6mfmtwc3%2F%2BCnTVNcwGPxLbGCqsxKH1OgsEmn7%2BSHvVuWzbCBV4rVkWNxtaWlPWqGA0SlWVYY0THVkrfhgeOqCVrmtcJhJN7OlbvaTS%2FpaCII2VIufDhMUJzF5QLWUwR%2FP5lMQT0Usvj7Z95BkQkJ8PFRuq8Q9nqsYl5bniHtLSj%2FOHdgpzILp83sWh98AtrZ04MLrW974GOqUBYb%2B0%2FufXeJOVrxx3vm%2F21xqVo%2FWDssddCnI4CvGSswSQ5O3uXGHCAx7j9va1TMFiJ0lerUFPtbWxM4F0UPpnJcOYYzhxBK7LpriXur%2Bv70aYCviC0C0sOWBBSYxhkvDHpXlwifflYmdko3GKCh5mOH5sAALozQh5hR3weo57OKSmBo2xMZmfwurjEwAnS7lhoLkocd%2FDuB75IUhJj%2FjGrf0TtnVl&X-Amz-Signature=b177da88e4e721cfaac9c5dbffd9aec2ce8a2acc35525d411906e79237f5a928&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
    {
      type: 'text',
      text:
        '- ***Script*** styles are for “hand made”, “raw” or “honest” messages. They can go from “wedding invitation” elegance level to “punk/street” shaky lines. Use them for games with punk gangs restoring public property or girly groups destroying public property. For these 2 examples both script examples would work interchangeably.',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/834a2359-62f7-43af-8871-5e1b4c7563b8/Script.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666KF36RKA%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233352Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJIMEYCIQC6ALd%2FSfLxXnfeHPwLpMosGrPadmhTJrSZPdT1ZRdkVAIhAJsAuB1M5blc73SqsYBYboIW2jGSjNi7oRCjpFk3oZO8KogECLD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgwdpI7FtHRoSretxXAq3AO4nPDEZCkWiKYzJqcwxM0sFoHhdFw0XCNQqR7t2p2VeAEeCtfbj827plsPuPd7AqbHLPAsbmuuS5HfRZlBB2bNn16ywSVQYLJf1pKGNPIm7nfGeij5yF%2B02ba8PmZfiHPQWjZ9IXzoKUio9aWtKRdb3oSY277TG9WmmrzcA6gFB1tkgDP3bwV6VNRLYlC2bEfl0SLsX0bEkPNupoXh%2B2cmTCFWAazxxWnf%2Bx9TfsQhRWGMEq9dD9q836QZpZk7Cdd4ppMLai5DSsxo5gjINxV40ffDpbAVDVC0%2BatPOWwTVS06Q3coUkkdMNSUnsf87qDsZMBi0RbT%2B5dV%2Bl336ZyFayEJbYKYuuGpG629Xhc17BUFoaCxJeK7sig1prmNnX37LMJGE1xIPnp34nXudXTLvJBto%2BLnamx3z6SXhaPI3ICdjHTawKIaSbuYGMFm6xjYORolHzzUv6JbWeTCV1bg5%2Ful2eLQsNAP%2BIW9HC31xSYWcKlj4J2OSY3OAhZ0Fukoh3Icuc%2B%2F76RvcPUP1ydemkijSt3siGFhh20vx%2F3AWubEWQauDZAN4Hau1FAiEZ4QCt9hHG0b9sXDby%2B8UHLHzcG8w%2BYlSdgYKKwjSMINsO%2FgHckvnsU%2BrDskqzDb1ve%2BBjqkAUcnRbCFWdwaSUWoh7u7DsdIrNxEu26%2Ficv94Oy3KubcRM5PytPDj%2F3sxgXW4SYGSPPv2%2F836evAMN8CEwihCsoz4JUvNqme%2BoavjXrBgEcv6o1USUBNiQYMX0mienlrinXgNHSlwHDEL4NR3z9FtCmaTpsai0z3VkyJ7AoUTblkT2V71h1OSGz4gPnasFI9UXGw6tSUHlIypguNukVhe4%2BB%2By7J&X-Amz-Signature=00ec4fc781021b9b958f660ec0018b05c2f154939fe3a5c96fc7430d0904130e&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
    {
      type: 'text',
      text:
        '- The ***Decorative*** classification has a lot of details in their design. It is used in big sizes for titles and short texts. This classification requires a word of caution: never use them in small sizes with texts longer than 3 or 5 words because depending on their design; most of them are hard to read.',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/63998d7d-2e4e-4d61-81b7-e2eb816d6098/Deco.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666KF36RKA%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233352Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJIMEYCIQC6ALd%2FSfLxXnfeHPwLpMosGrPadmhTJrSZPdT1ZRdkVAIhAJsAuB1M5blc73SqsYBYboIW2jGSjNi7oRCjpFk3oZO8KogECLD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgwdpI7FtHRoSretxXAq3AO4nPDEZCkWiKYzJqcwxM0sFoHhdFw0XCNQqR7t2p2VeAEeCtfbj827plsPuPd7AqbHLPAsbmuuS5HfRZlBB2bNn16ywSVQYLJf1pKGNPIm7nfGeij5yF%2B02ba8PmZfiHPQWjZ9IXzoKUio9aWtKRdb3oSY277TG9WmmrzcA6gFB1tkgDP3bwV6VNRLYlC2bEfl0SLsX0bEkPNupoXh%2B2cmTCFWAazxxWnf%2Bx9TfsQhRWGMEq9dD9q836QZpZk7Cdd4ppMLai5DSsxo5gjINxV40ffDpbAVDVC0%2BatPOWwTVS06Q3coUkkdMNSUnsf87qDsZMBi0RbT%2B5dV%2Bl336ZyFayEJbYKYuuGpG629Xhc17BUFoaCxJeK7sig1prmNnX37LMJGE1xIPnp34nXudXTLvJBto%2BLnamx3z6SXhaPI3ICdjHTawKIaSbuYGMFm6xjYORolHzzUv6JbWeTCV1bg5%2Ful2eLQsNAP%2BIW9HC31xSYWcKlj4J2OSY3OAhZ0Fukoh3Icuc%2B%2F76RvcPUP1ydemkijSt3siGFhh20vx%2F3AWubEWQauDZAN4Hau1FAiEZ4QCt9hHG0b9sXDby%2B8UHLHzcG8w%2BYlSdgYKKwjSMINsO%2FgHckvnsU%2BrDskqzDb1ve%2BBjqkAUcnRbCFWdwaSUWoh7u7DsdIrNxEu26%2Ficv94Oy3KubcRM5PytPDj%2F3sxgXW4SYGSPPv2%2F836evAMN8CEwihCsoz4JUvNqme%2BoavjXrBgEcv6o1USUBNiQYMX0mienlrinXgNHSlwHDEL4NR3z9FtCmaTpsai0z3VkyJ7AoUTblkT2V71h1OSGz4gPnasFI9UXGw6tSUHlIypguNukVhe4%2BB%2By7J&X-Amz-Signature=5f13ed55ad2d25c52b940dddac4bcbcfcdfdda4f53ec99d1a543b126f515e421&X-Amz-SignedHeaders=host&x-id=GetObject',
      caption:
        '*Examples of decorative styles designed by professional type designers. All credits to their authors.*',
    },
    {
      type: 'text',
      text:
        'Once you have identified the category that better matches the identity of your game, think about the language in which you’ll be displaying your texts. You might need accents, or special characters that are not be available on English-only alphabets.',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/8d3c83d1-e20f-411e-8a6d-3a6a331d350e/Fontographer_software.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4662IGOZ5IN%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233355Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJGMEQCIALw07AS5uJ%2FNBi8Z5dJzzy8vtqgNJcZ0kG2JmuOjX8TAiA0rP1gWZL9SRLhNyEbL0EbYbZXIddHYEUxbokyQfrutSqIBAiw%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMCTMP9GJ5m5qBqfszKtwDPRLq1irTXP%2BBH%2BWHKO0aAhTFaXleN991kS%2F9KXy1QJ5yN8SGlWHcDWVlNI5VzoLomgWEudURv3O8%2F2zm3YA537YxP1jSRR7x9cjnMAHqjIbDHqQ2FmFXzKsZorYZHq1Tr%2BDtcSg92h4UIgG6I4CD0l6GJ9A0qZ5IRvMyuaqQVKvtijdlU%2F2tPjakp8nHCUBlIyzUzz5sLnU4%2BkAyJfwnv7HfdmI4LaiBXReER%2F0ggGHAFXh0JnBvolh6nv5khYnw8PvoYUluMTHvV0XOu%2BahX6%2BfhTmjFMGWOEtUWdscVyiejVwiu9nN0l0LStKzKthGMn0jMzMHkkOLVr3Zon6ulNHO9FTwYF483d1f%2F9pTi72DYpojASRY%2Bu6UoQzBolVCfAsCaE%2FmhpFjTW60D3D4nO1IM8lSWm%2FOOf%2BaOT9QPuWYdUs5I2m8IimJlJ%2FIWFl%2BAEQBK8HzF4K6vhb4g9ims23V0iwygNzlps2eA8t514QY3Hh5u%2FjMjrZ%2B6%2BNyWJwIUA%2FmickC2Zgci1lRvARTE%2BHfzLeR1NIgzMZQtSRK9tHZQIZZnMsdpuGhn9JtU4tOYNuX6LwWiGmuGY9I3MEaCMXpJKP0avk6JrpqdXJ4qtZHMEbsedFiF2q0ugow29b3vgY6pgEFoaqxT82yP6fDYe%2BGp65eRDSKdENWfW1nmKCpxFnzgsoHVTRok63LRTBv1iKoLYjASBhT%2FhH%2BcmwwKPDkXv80IucjRvr1fnwC3%2B5KceFZbrKL9Q1LeOmV3RgowynDQnr0qtdp1tNWhoKPNF6KHtaoK5kELXmW5yx8oPKt4%2B8cP2dMOq6F5DicJQE77%2FEQuyvRV2%2F0dS%2BUdrEp6Si3L69XFSW0Lf%2FO&X-Amz-Signature=a5a87609b2a8ec4bd016ee73e7b88f07ee35e9ba65200da51b15d9dd1ae722ff&X-Amz-SignedHeaders=host&x-id=GetObject',
      caption:
        '*Example of letter variables to consider when designing a font for different languages. Credits to the Fontographer software.*',
    },
    {
      type: 'text',
      text:
        'After you’ve defined the most important information, you can start searching for available fonts.',
    },
    {
      type: 'text',
      text:
        "[Google Fonts](https://fonts.google.com/) is a Designer’s preferred resource as it offers language and style filtering options. Their fonts are high quality and integrate well with the tools we'll use in these lessons.\n\nFor a deeper dive into typography, check out their [Knowledge base](https://fonts.google.com/knowledge/topics/essentials).",
    },
    {
      type: 'text',
      text:
        "Here's how to choose fonts: Use the filters on the left to select your language (1) and desired style category (2), then type a sample phrase in your language at the top of the page (3).\n\nOnce you've set these filters, browse through the available options to find a font that matches your needs.",
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/3783994d-6877-47b8-8419-819e682a0448/Google_fonts_-_Catalog.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666KF36RKA%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233352Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJIMEYCIQC6ALd%2FSfLxXnfeHPwLpMosGrPadmhTJrSZPdT1ZRdkVAIhAJsAuB1M5blc73SqsYBYboIW2jGSjNi7oRCjpFk3oZO8KogECLD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgwdpI7FtHRoSretxXAq3AO4nPDEZCkWiKYzJqcwxM0sFoHhdFw0XCNQqR7t2p2VeAEeCtfbj827plsPuPd7AqbHLPAsbmuuS5HfRZlBB2bNn16ywSVQYLJf1pKGNPIm7nfGeij5yF%2B02ba8PmZfiHPQWjZ9IXzoKUio9aWtKRdb3oSY277TG9WmmrzcA6gFB1tkgDP3bwV6VNRLYlC2bEfl0SLsX0bEkPNupoXh%2B2cmTCFWAazxxWnf%2Bx9TfsQhRWGMEq9dD9q836QZpZk7Cdd4ppMLai5DSsxo5gjINxV40ffDpbAVDVC0%2BatPOWwTVS06Q3coUkkdMNSUnsf87qDsZMBi0RbT%2B5dV%2Bl336ZyFayEJbYKYuuGpG629Xhc17BUFoaCxJeK7sig1prmNnX37LMJGE1xIPnp34nXudXTLvJBto%2BLnamx3z6SXhaPI3ICdjHTawKIaSbuYGMFm6xjYORolHzzUv6JbWeTCV1bg5%2Ful2eLQsNAP%2BIW9HC31xSYWcKlj4J2OSY3OAhZ0Fukoh3Icuc%2B%2F76RvcPUP1ydemkijSt3siGFhh20vx%2F3AWubEWQauDZAN4Hau1FAiEZ4QCt9hHG0b9sXDby%2B8UHLHzcG8w%2BYlSdgYKKwjSMINsO%2FgHckvnsU%2BrDskqzDb1ve%2BBjqkAUcnRbCFWdwaSUWoh7u7DsdIrNxEu26%2Ficv94Oy3KubcRM5PytPDj%2F3sxgXW4SYGSPPv2%2F836evAMN8CEwihCsoz4JUvNqme%2BoavjXrBgEcv6o1USUBNiQYMX0mienlrinXgNHSlwHDEL4NR3z9FtCmaTpsai0z3VkyJ7AoUTblkT2V71h1OSGz4gPnasFI9UXGw6tSUHlIypguNukVhe4%2BB%2By7J&X-Amz-Signature=445c5b192dfbb756ef9656488e9e4417bada4b536d7ff3f8ef020e14c8847ee6&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
    {
      type: 'text',
      text:
        'Once you’ve opened the font of your choice, you can get the file by clicking on “Get font”',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/fc1510ce-7081-462b-a333-cb38b26136d9/Google_fonts_-_download.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666KF36RKA%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233352Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJIMEYCIQC6ALd%2FSfLxXnfeHPwLpMosGrPadmhTJrSZPdT1ZRdkVAIhAJsAuB1M5blc73SqsYBYboIW2jGSjNi7oRCjpFk3oZO8KogECLD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgwdpI7FtHRoSretxXAq3AO4nPDEZCkWiKYzJqcwxM0sFoHhdFw0XCNQqR7t2p2VeAEeCtfbj827plsPuPd7AqbHLPAsbmuuS5HfRZlBB2bNn16ywSVQYLJf1pKGNPIm7nfGeij5yF%2B02ba8PmZfiHPQWjZ9IXzoKUio9aWtKRdb3oSY277TG9WmmrzcA6gFB1tkgDP3bwV6VNRLYlC2bEfl0SLsX0bEkPNupoXh%2B2cmTCFWAazxxWnf%2Bx9TfsQhRWGMEq9dD9q836QZpZk7Cdd4ppMLai5DSsxo5gjINxV40ffDpbAVDVC0%2BatPOWwTVS06Q3coUkkdMNSUnsf87qDsZMBi0RbT%2B5dV%2Bl336ZyFayEJbYKYuuGpG629Xhc17BUFoaCxJeK7sig1prmNnX37LMJGE1xIPnp34nXudXTLvJBto%2BLnamx3z6SXhaPI3ICdjHTawKIaSbuYGMFm6xjYORolHzzUv6JbWeTCV1bg5%2Ful2eLQsNAP%2BIW9HC31xSYWcKlj4J2OSY3OAhZ0Fukoh3Icuc%2B%2F76RvcPUP1ydemkijSt3siGFhh20vx%2F3AWubEWQauDZAN4Hau1FAiEZ4QCt9hHG0b9sXDby%2B8UHLHzcG8w%2BYlSdgYKKwjSMINsO%2FgHckvnsU%2BrDskqzDb1ve%2BBjqkAUcnRbCFWdwaSUWoh7u7DsdIrNxEu26%2Ficv94Oy3KubcRM5PytPDj%2F3sxgXW4SYGSPPv2%2F836evAMN8CEwihCsoz4JUvNqme%2BoavjXrBgEcv6o1USUBNiQYMX0mienlrinXgNHSlwHDEL4NR3z9FtCmaTpsai0z3VkyJ7AoUTblkT2V71h1OSGz4gPnasFI9UXGw6tSUHlIypguNukVhe4%2BB%2By7J&X-Amz-Signature=97f404278255a874a2df4ee56ab45b12dae4dd332d158c50542c15c693b2b3bc&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
    {
      type: 'text',
      text:
        'And you click on “Download” to get the “.ttf” files, which you will have to upload to GDevelop.',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/fa2f8a76-f13e-4923-bb3e-b5cd3ecb5dfd/Google_fonts_-_get_files.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666KF36RKA%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233352Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJIMEYCIQC6ALd%2FSfLxXnfeHPwLpMosGrPadmhTJrSZPdT1ZRdkVAIhAJsAuB1M5blc73SqsYBYboIW2jGSjNi7oRCjpFk3oZO8KogECLD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgwdpI7FtHRoSretxXAq3AO4nPDEZCkWiKYzJqcwxM0sFoHhdFw0XCNQqR7t2p2VeAEeCtfbj827plsPuPd7AqbHLPAsbmuuS5HfRZlBB2bNn16ywSVQYLJf1pKGNPIm7nfGeij5yF%2B02ba8PmZfiHPQWjZ9IXzoKUio9aWtKRdb3oSY277TG9WmmrzcA6gFB1tkgDP3bwV6VNRLYlC2bEfl0SLsX0bEkPNupoXh%2B2cmTCFWAazxxWnf%2Bx9TfsQhRWGMEq9dD9q836QZpZk7Cdd4ppMLai5DSsxo5gjINxV40ffDpbAVDVC0%2BatPOWwTVS06Q3coUkkdMNSUnsf87qDsZMBi0RbT%2B5dV%2Bl336ZyFayEJbYKYuuGpG629Xhc17BUFoaCxJeK7sig1prmNnX37LMJGE1xIPnp34nXudXTLvJBto%2BLnamx3z6SXhaPI3ICdjHTawKIaSbuYGMFm6xjYORolHzzUv6JbWeTCV1bg5%2Ful2eLQsNAP%2BIW9HC31xSYWcKlj4J2OSY3OAhZ0Fukoh3Icuc%2B%2F76RvcPUP1ydemkijSt3siGFhh20vx%2F3AWubEWQauDZAN4Hau1FAiEZ4QCt9hHG0b9sXDby%2B8UHLHzcG8w%2BYlSdgYKKwjSMINsO%2FgHckvnsU%2BrDskqzDb1ve%2BBjqkAUcnRbCFWdwaSUWoh7u7DsdIrNxEu26%2Ficv94Oy3KubcRM5PytPDj%2F3sxgXW4SYGSPPv2%2F836evAMN8CEwihCsoz4JUvNqme%2BoavjXrBgEcv6o1USUBNiQYMX0mienlrinXgNHSlwHDEL4NR3z9FtCmaTpsai0z3VkyJ7AoUTblkT2V71h1OSGz4gPnasFI9UXGw6tSUHlIypguNukVhe4%2BB%2By7J&X-Amz-Signature=371e543f03c96afabc1efb1b1f55193ca6f1cc976945eb88715e88ef62555032&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
    {
      type: 'text',
      text:
        'Other available sources to get Font Families are [dafont.com](https://www.dafont.com/fr/) and [fontsquirrel.com](https://www.fontsquirrel.com/). However, you will notice that displaying preview text in their interfaces is harder than with Google Fonts.',
    },
    {
      type: 'text',
      text:
        'Pay special attention to font design during text previews. Choose font families that are easy to read to prevent players from confusing similar characters. Fonts that clearly distinguish between letters like *p* and *q*, Capital *I*, letter *l* and number *1*, and *o* and *a* are more readable for all players, especially those with dyslexia.',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/bc934eba-d582-4a6d-b758-a8af711599d2/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666KF36RKA%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233353Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJIMEYCIQC6ALd%2FSfLxXnfeHPwLpMosGrPadmhTJrSZPdT1ZRdkVAIhAJsAuB1M5blc73SqsYBYboIW2jGSjNi7oRCjpFk3oZO8KogECLD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgwdpI7FtHRoSretxXAq3AO4nPDEZCkWiKYzJqcwxM0sFoHhdFw0XCNQqR7t2p2VeAEeCtfbj827plsPuPd7AqbHLPAsbmuuS5HfRZlBB2bNn16ywSVQYLJf1pKGNPIm7nfGeij5yF%2B02ba8PmZfiHPQWjZ9IXzoKUio9aWtKRdb3oSY277TG9WmmrzcA6gFB1tkgDP3bwV6VNRLYlC2bEfl0SLsX0bEkPNupoXh%2B2cmTCFWAazxxWnf%2Bx9TfsQhRWGMEq9dD9q836QZpZk7Cdd4ppMLai5DSsxo5gjINxV40ffDpbAVDVC0%2BatPOWwTVS06Q3coUkkdMNSUnsf87qDsZMBi0RbT%2B5dV%2Bl336ZyFayEJbYKYuuGpG629Xhc17BUFoaCxJeK7sig1prmNnX37LMJGE1xIPnp34nXudXTLvJBto%2BLnamx3z6SXhaPI3ICdjHTawKIaSbuYGMFm6xjYORolHzzUv6JbWeTCV1bg5%2Ful2eLQsNAP%2BIW9HC31xSYWcKlj4J2OSY3OAhZ0Fukoh3Icuc%2B%2F76RvcPUP1ydemkijSt3siGFhh20vx%2F3AWubEWQauDZAN4Hau1FAiEZ4QCt9hHG0b9sXDby%2B8UHLHzcG8w%2BYlSdgYKKwjSMINsO%2FgHckvnsU%2BrDskqzDb1ve%2BBjqkAUcnRbCFWdwaSUWoh7u7DsdIrNxEu26%2Ficv94Oy3KubcRM5PytPDj%2F3sxgXW4SYGSPPv2%2F836evAMN8CEwihCsoz4JUvNqme%2BoavjXrBgEcv6o1USUBNiQYMX0mienlrinXgNHSlwHDEL4NR3z9FtCmaTpsai0z3VkyJ7AoUTblkT2V71h1OSGz4gPnasFI9UXGw6tSUHlIypguNukVhe4%2BB%2By7J&X-Amz-Signature=4ecd49dfec8afbcc1a49d5049d90338cd8186cf92b2e34a8ccdf2e0abab2a6c5&X-Amz-SignedHeaders=host&x-id=GetObject',
      caption:
        '*Inclusive Sans dyslexic friendly design by Typography Designer Olivia King available on Google fonts.*',
    },
    {
      type: 'task',
      title: 'Task 1:',
      items: [
        {
          type: 'text',
          text:
            'Use the knowledge that you’ve acquired in this chapter and choose a Google Font for the Rogue-like game from chapter 2. Once you’ve done so, download the .ttf file and replace the texts in the Game Main Screen on the template.',
        },
      ],
      answer: {
        items: [
          {
            type: 'image',
            url:
              'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/a00999a2-8d46-4354-8251-87ca1eebb752/TypeScale-Scales_-_Task_2_-_Answer.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46627AGRJLL%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233353Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJGMEQCIDxGymdn8gxh7NT5ZuAJYhRKes9c02BmW0zAVfvI1cZsAiAl9Ofm3vH1ttlF9PNM1%2FenKb1Z%2B4XJjGacCzeWRwk7eSqIBAiw%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMcd%2FHXxvJFoHRn9PIKtwDbInqmvV7stHt%2BEtIkMLUJ%2FYKBOL81f0bm257g%2FGon5UMaPzDPe%2FxiGMSBP68EKrWNUMz8CQm0mgth1FZEjE85t2tuLf1TAYLy0HoSs3fmMVMh1s5sbn1X8ucEH4mKdIZof33oDxjxGQTDHNgeLOTedGJbojP9acb2KScOlRJ0uMjN1LUwb2DGeYFa7sZwMPKNv8jE%2FUCCHAwDT2Q1ca2D6my%2FI4WPDqJfNiX%2FZkMTV%2FxNHHYQ2FSbkLu4AfU%2B%2B32DlvWk2IkF2V%2BetnPkDiOeYm5bZf6MetXBVy323XIdQVfKZYZXV%2BZZVaGI84%2FRfnNByxbK1RX1XqJFUZq7iSGWHOwgLXAIfHluLyVWz3lxogXnypR10U%2FyQb8sKJQtdfRNP4ox0kMncUNvwydg1dYQURT1WbMlm4b6ngIJfHRzBQ48%2F8dEN0LH49aTKxj4u2%2BCFaL%2FH%2Bqgqs%2Fslb8nYNsk4Bu62DhjdF1uD06OcvcUHizhGLHkpNjrxlBXfQyim2LiaCu2Q77WBQSsX6GFDLpJNvx%2BzO5QMnpxlSHLurGzOFhggGO1YU2E1duv2%2F%2B8B7SQ0K1TeFbTgXAFbkyJTOxJNg0B1aaO9VVDCAXp13dXL5I%2BYgn%2Bt3CegV928Awwdb3vgY6pgERuBRuQggxSQKmcxwhhKmIDAPeWaMAjt8iNLjm0JYV7w936mRDUl%2F02UOWTfbUN5lgZbMJ96Jb9BFwjg21FbR2MZBTJHDAlbs4PkY7Tv%2FG83yAfqXST2oFaFMqvYMIWr17pBqCGE9e7lcY0ZXADt50%2FuMDWbgpqs%2FCU%2BeSXQPUdYYTy50ZHImUHgixI1lOC1%2FMfCEvg6CtPkXzUTqYL31vY0ZhNzgF&X-Amz-Signature=c633446cc0f4204880d19cba84c1a6f8ad82e416d0321629504524aff1442d7a&X-Amz-SignedHeaders=host&x-id=GetObject',
          },
        ],
      },
    },
    { type: 'text', text: '### Creating Typescales' },
    {
      type: 'text',
      text:
        'Remember the list of objects and features from the Hierarchy chapter? The same principles apply to text—we need different sizes for titles, subtitles, and button text.',
    },
    {
      type: 'text',
      text:
        'Instead of setting these sizes randomly, there\'s a better approach: using a "type scale." UI designers use type scales to create a logical size progression that helps users instantly grasp information hierarchy. These scales use exponential values to maintain consistent proportions between text elements. For creating UI type scales, I recommend [typescale.com](https://typescale.com/).',
    },
    {
      type: 'text',
      text:
        'Start by selecting your Google Fonts typeface and setting the Body Size (1). This will be your main text size—16px works well for readability. Then play with the Scale parameter (2) to generate seven size variants for your UI. Make sure to select the "PX" tab at the top (3) to get values you can use directly in GDevelop.',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/1300732d-f5a6-468b-bb60-3558f4a6695c/TypeScale-Scales.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46627AGRJLL%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233353Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJGMEQCIDxGymdn8gxh7NT5ZuAJYhRKes9c02BmW0zAVfvI1cZsAiAl9Ofm3vH1ttlF9PNM1%2FenKb1Z%2B4XJjGacCzeWRwk7eSqIBAiw%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMcd%2FHXxvJFoHRn9PIKtwDbInqmvV7stHt%2BEtIkMLUJ%2FYKBOL81f0bm257g%2FGon5UMaPzDPe%2FxiGMSBP68EKrWNUMz8CQm0mgth1FZEjE85t2tuLf1TAYLy0HoSs3fmMVMh1s5sbn1X8ucEH4mKdIZof33oDxjxGQTDHNgeLOTedGJbojP9acb2KScOlRJ0uMjN1LUwb2DGeYFa7sZwMPKNv8jE%2FUCCHAwDT2Q1ca2D6my%2FI4WPDqJfNiX%2FZkMTV%2FxNHHYQ2FSbkLu4AfU%2B%2B32DlvWk2IkF2V%2BetnPkDiOeYm5bZf6MetXBVy323XIdQVfKZYZXV%2BZZVaGI84%2FRfnNByxbK1RX1XqJFUZq7iSGWHOwgLXAIfHluLyVWz3lxogXnypR10U%2FyQb8sKJQtdfRNP4ox0kMncUNvwydg1dYQURT1WbMlm4b6ngIJfHRzBQ48%2F8dEN0LH49aTKxj4u2%2BCFaL%2FH%2Bqgqs%2Fslb8nYNsk4Bu62DhjdF1uD06OcvcUHizhGLHkpNjrxlBXfQyim2LiaCu2Q77WBQSsX6GFDLpJNvx%2BzO5QMnpxlSHLurGzOFhggGO1YU2E1duv2%2F%2B8B7SQ0K1TeFbTgXAFbkyJTOxJNg0B1aaO9VVDCAXp13dXL5I%2BYgn%2Bt3CegV928Awwdb3vgY6pgERuBRuQggxSQKmcxwhhKmIDAPeWaMAjt8iNLjm0JYV7w936mRDUl%2F02UOWTfbUN5lgZbMJ96Jb9BFwjg21FbR2MZBTJHDAlbs4PkY7Tv%2FG83yAfqXST2oFaFMqvYMIWr17pBqCGE9e7lcY0ZXADt50%2FuMDWbgpqs%2FCU%2BeSXQPUdYYTy50ZHImUHgixI1lOC1%2FMfCEvg6CtPkXzUTqYL31vY0ZhNzgF&X-Amz-Signature=56dd845dab7adbcb11e7751bf698a74b3bd3a4ba89d8bd2ab2cd22e6e6dcef67&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
    {
      type: 'task',
      title: 'Task 2: ',
      items: [
        {
          type: 'text',
          text:
            'With the help of the knowledge that you’ve just acquired, create your first scale and change the size in the menu items in the game to follow the hierarchy or order of importance of each element.',
        },
      ],
      answer: {
        items: [
          {
            type: 'text',
            text:
              'The scale that you’re going to use depends on the “vibe” of the game as well as the size of your targeted screen. The greater the scale ratio is in your typescale, the harder it will be to reuse it across mobile and desktop: highly contrasted scales might look disproportionate on mobile (huge H1 titles and not so big P styles), while mobile scales might appear too small on desktop. This is one of the reasons why mobile and desktop UI must be designed separately. Create a private build of the template and open it on mobile to see if you can read and distinguish each letter.',
          },
        ],
      },
    },
  ],
};
const courseChapter1: UnlockedTextBasedCourseChapter = {
  id: 'intro',
  title: 'Introduction',
  templates: [],
  items: [
    {
      type: 'text',
      text:
        "Welcome to this comprehensive course on User Interface (UI) and User Experience (UX)! Whether you're a solo developer or part of a small team, understanding these principles is crucial for creating cohesive UI controllers, designing smooth experiences, and testing with your players before the official launch of your game.",
    },
    {
      type: 'text',
      text:
        "Throughout this course, we'll explore the fundamental concepts of UI and UX design, breaking down complex theory and topics into practical easy-to-apply guidelines. You’ll also receive practical tools and data bases available online for free to enhance your game development process.",
    },
    {
      type: 'text',
      text:
        "While we won't dive into advanced design concepts and practices, you'll gain enough knowledge to make informed decisions about your game's interface and game progression. By the end of this course, you'll have a solid foundation in UI/UX principles like visual hierarchy, typography, color theory, and how these elements work together to create intuitive game interfaces. ",
    },
    {
      type: 'text',
      text:
        "Let's start by understanding the basics of UI and UX, and how they contribute to creating successful games:",
    },
    {
      type: 'text',
      text:
        '- **What is the role of UI and UX to make good games?**\n\n  A game UI is made up game assets and sprites; while game mechanics, game play and level of difficulty are UX. Imagine a game without game art and without sounds. You will probably be clicking buttons without any feedback on your progress. That wouldn’t be fun.\n\n  However, with beautiful art and animations (UI), good sound design, motivating game progression and feedback on your progress (UX), what could be “just clicking buttons” becomes fun and exciting!  This is why video-games are the perfect example of UI/UX!',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/0426867a-ae95-485a-885d-16a46bb9886f/monstra.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666KF36RKA%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233352Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJIMEYCIQC6ALd%2FSfLxXnfeHPwLpMosGrPadmhTJrSZPdT1ZRdkVAIhAJsAuB1M5blc73SqsYBYboIW2jGSjNi7oRCjpFk3oZO8KogECLD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgwdpI7FtHRoSretxXAq3AO4nPDEZCkWiKYzJqcwxM0sFoHhdFw0XCNQqR7t2p2VeAEeCtfbj827plsPuPd7AqbHLPAsbmuuS5HfRZlBB2bNn16ywSVQYLJf1pKGNPIm7nfGeij5yF%2B02ba8PmZfiHPQWjZ9IXzoKUio9aWtKRdb3oSY277TG9WmmrzcA6gFB1tkgDP3bwV6VNRLYlC2bEfl0SLsX0bEkPNupoXh%2B2cmTCFWAazxxWnf%2Bx9TfsQhRWGMEq9dD9q836QZpZk7Cdd4ppMLai5DSsxo5gjINxV40ffDpbAVDVC0%2BatPOWwTVS06Q3coUkkdMNSUnsf87qDsZMBi0RbT%2B5dV%2Bl336ZyFayEJbYKYuuGpG629Xhc17BUFoaCxJeK7sig1prmNnX37LMJGE1xIPnp34nXudXTLvJBto%2BLnamx3z6SXhaPI3ICdjHTawKIaSbuYGMFm6xjYORolHzzUv6JbWeTCV1bg5%2Ful2eLQsNAP%2BIW9HC31xSYWcKlj4J2OSY3OAhZ0Fukoh3Icuc%2B%2F76RvcPUP1ydemkijSt3siGFhh20vx%2F3AWubEWQauDZAN4Hau1FAiEZ4QCt9hHG0b9sXDby%2B8UHLHzcG8w%2BYlSdgYKKwjSMINsO%2FgHckvnsU%2BrDskqzDb1ve%2BBjqkAUcnRbCFWdwaSUWoh7u7DsdIrNxEu26%2Ficv94Oy3KubcRM5PytPDj%2F3sxgXW4SYGSPPv2%2F836evAMN8CEwihCsoz4JUvNqme%2BoavjXrBgEcv6o1USUBNiQYMX0mienlrinXgNHSlwHDEL4NR3z9FtCmaTpsai0z3VkyJ7AoUTblkT2V71h1OSGz4gPnasFI9UXGw6tSUHlIypguNukVhe4%2BB%2By7J&X-Amz-Signature=7eb6697a2dea497ff86d6b0fcd711061ab766d821e214b4ffe8d0997c0914f41&X-Amz-SignedHeaders=host&x-id=GetObject',
      caption: '*Monstra by Game Creator MOHMOH available on gd.games*',
    },
    {
      type: 'text',
      text:
        "- **Ok, but what is User Interface and what's its purpose?**\n\n  A game's UI consists of buttons, progress bars, character animations, settings screens, and stats. These components communicate essential information to players clearly and simply, helping them understand the game state and make informed decisions.",
    },
    {
      type: 'text',
      text:
        '- **And what is “User Experience”, and what’s its purpose?**\n\n  It’s the overall experience of a player while they interact with a game or application. It includes how intuitive, enjoyable, and accessible the experience feels from the moment they launch the game to when they stop playing.',
    },
    {
      type: 'text',
      text:
        '- **What are the visual elements of UI interfaces?**\n\n  The main blocks of UI design are Letters, color and Shape. But when we talk about interaction we also have Sound and Movement.',
    },
    {
      type: 'text',
      text:
        '- **Let’s quickly talk about letters:**\n\n  Did you know that ”making letters” is a job? “Typography Designers” -which is their official name- create letters to fit physical supports like print, desktop and mobile. They also make sure they can be read up close or far away, as well as by people with cognitive disabilities. For example: it has been proven that people with dyslexia can benefit from specific traits in letter design, which is how the font “Dyslexie” was designed.',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/2e9daaf5-c2a8-4401-8446-6b7bd6f38771/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667X43HVKG%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233355Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJGMEQCIGzCA%2BZrAc0mCIFkdz9s4vRD%2FIn%2FfIt7PWwZtmbIPMLPAiBG4E80%2FUvfLhGub%2FZIEiAR5DxJgE%2FFAbo%2FHezl2ipIJCqIBAiw%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIM66kdZFYkUTXue%2BEdKtwD%2Fj6S9sdPdJ%2F4xE4%2B%2BH3266%2FYZ66js21CZ33ly4SeuW5P3VdwBid%2FymKGLY9Wh5HtU%2FdKU88cZJGTbCT%2FNq3MDZpGno2ucKyEewQ5zSq0L821sn1hRTcHDo8vi8iInPm7ievqoNv4cxQX8bLPqI665e6KJlrC41ioCWP2gwvttY2Q3ApYAMzhbyviFcmSHzwUJZsv%2BbZhTggdnN9yqK%2BoCPL4cgg7XzXuRr5c9CRKhNWwgYZBcaqbjxwsJLUc0Yn%2BauGPDbtfUz%2B8Asj4aLYRE40xYF00Y66wvWxJs7%2BkShtjWBwvU%2FmFOgMhndXt%2Bxrcd1x9p7rRJ239WQZzzTLeiN1YQx2j%2F04JmMFgdo3taUvm0FSY15okV%2B4yLxkXcBg7VEoHOF9qMXKXD%2FIjSXv9sfQ7fq2HZ6LL6FbV%2BYgtpvx9Y2YH2x3%2FD8Ocf6iolOOKJjpNJUGE3LrfQvUnetfiPNPbqlSyynjfIUc24It3c1Js6G7UbU05bKuODEmzDuTBJyz1dgD0KX2zCL04nVJ5xkyOptC1kbtSChIXZ0YIFfjj4LRT1IFAT0%2Bnfy%2BlFMfRTDysLsAfvJGxTKKhUPB2T2%2FHd3QXPYwVSYJCd5IOsz%2BoQbTry1%2FBvo8RCZow09b3vgY6pgEw%2BEgIm%2FbLW5Ovp2pMnMobq%2BjN3QSPs5dCBM8p9ZRuzAmAat1K47%2Fuy4CV4iKvJk0USUG7Gjw8HtinjZRbZ7CyjEakDPJcPO4nYbFC1jFQlnFVe2pmu4zUdqBTqG7JUc2gqYp4AfI3HKyRKFc048CgVc2Z%2Fy4sVsyQYSB5g%2FQak5TO5fA7eesFsyRpApRydmQfPiHNPTB1iaR%2BFVINt0C07LOwI1aX&X-Amz-Signature=5a47ca020916b102f41a0847c6c8deec45181ced61c2cb6243c153e1fdf44395&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
    {
      type: 'text',
      text:
        "&#9;While you don't need to be a type designer to select fonts, this course will provide practical guidelines to ensure your chosen font family creates a positive experience for your players.",
    },
    { type: 'text', text: '- **Let’s talk about color**' },
    {
      type: 'text',
      text:
        '&#9;Color is a fascinating phenomenon that occurs when surfaces reflect light, which our eyes then perceive. What makes color especially interesting is that it exists in our eyes—meaning different people can perceive the same color in different ways:',
    },
    {
      type: 'text',
      text:
        '&#9;In 2015 *this* dress became viral because certain people saw a red/golden dress, while others saw a blue/black dress… ',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/d079a8a9-4ebf-4933-b02a-6fc9b95e0d46/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466THYDE25S%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233355Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJHMEUCIEZOJJCTdEbIPxv8tEvek%2FbB52ZYoDAkloHjVLr1LknzAiEA5QLM7k30oqPh9YLiNriFQYmHtGEY%2ByIaGzxyfaWKXfwqiAQIsP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDBlB%2BD5kKYSniCM53ircAxXnOjTss67MqJWWV2v3siCH3HA7NBAVSB9PSDUAqXmlaasmQyuPUvc5IzV0PQcsP0B6VLJYj%2F5iKIiXf9JUQbBGgZ479Tt%2F2CUWxFVJoxigqogcKBz5Jq4wExYFfIigXrrDqlEArD6DtDrpLpSt2S8Taw5zQes8vEDStGc%2FCQ%2FZ8znTwhUz7%2F2UpqkDWSwSJRZba%2B73BMTXmYDlI%2FEprPRJWPOVYn2SkyGBeshW9jsEB9C%2Bu7xYcUxhVHzWz2dczVp%2FDhTwA2nZt5tpfNFbhGnM%2FsY9vq1rDqfnytM2F6gGDApMbSI5oWzNkEXs9c0eSQ61kyAvKDMEFlloDbeSd8AF6p5oxqT90XDizdHiqaHqSGlqBXvNBsS9aYJ%2B66%2FlSMFRzTBAN44WIy1OCUxttZzcn7y55Xu4qP076urJlGUyH0zB1VJnlmhDVL8tL9fzPTXOv4EK5%2F0AosBOStfhaH7Zj5%2B74OQn8fycexcVVPR6OQwyaZE7xNNXXMnuCZI0Q9P94oITZYLsk60aqa2QcHfGGMn9TmO5zcBqT%2BkgK8hnq4x9OQD%2F7UcgUlNCVrbgZ%2FgoCKwdoe9IaTxVT%2FhqIEGhc3U%2BEtEP9u0gUUO4r7kxZ44np7wlu2L0wJe4MPbW974GOqUBurV2wj7hpg%2FQZpomlxFfokUEYx5fu2sku3RG9QUzWTrJOrJl1U7rtYkof9fxztlvvHXYKi8Zq1CEwpqr9qZsWUu3oOSNzUhI1nCoDkZy3tWQ%2BX8AR69XwZ26WPk1WwaZgxkgEMvhiXcrRNBtclbCSZf6CFVonS1t%2FrimexnVWYIyaweVxSoSaeuZ4If7T4leo9exIDs%2BVOPNzR4MSdiHSfBAJ6dK&X-Amz-Signature=f516389fee295f5605e2999ff794dd1d3f1ddc6b83e1e5cd81cb85fd5e260853&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
    {
      type: 'text',
      text:
        '&#9;During this course you will learn how to understand and work with color and color palette models, as well as creating for people perceiving color differently.',
    },
    {
      type: 'task',
      title: 'Task:',
      items: [
        {
          type: 'text',
          text:
            'Look at how your eyes process color: stare at the red dot in this Mona Lisa image for 20 seconds, then close your eyes.\n\nWhat causes you to see the image in different colors when your eyes are closed?',
        },
        {
          type: 'image',
          url:
            'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/f97e3d55-326b-49a2-9fa3-49673822115c/Monalisa.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666KF36RKA%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233352Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJIMEYCIQC6ALd%2FSfLxXnfeHPwLpMosGrPadmhTJrSZPdT1ZRdkVAIhAJsAuB1M5blc73SqsYBYboIW2jGSjNi7oRCjpFk3oZO8KogECLD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgwdpI7FtHRoSretxXAq3AO4nPDEZCkWiKYzJqcwxM0sFoHhdFw0XCNQqR7t2p2VeAEeCtfbj827plsPuPd7AqbHLPAsbmuuS5HfRZlBB2bNn16ywSVQYLJf1pKGNPIm7nfGeij5yF%2B02ba8PmZfiHPQWjZ9IXzoKUio9aWtKRdb3oSY277TG9WmmrzcA6gFB1tkgDP3bwV6VNRLYlC2bEfl0SLsX0bEkPNupoXh%2B2cmTCFWAazxxWnf%2Bx9TfsQhRWGMEq9dD9q836QZpZk7Cdd4ppMLai5DSsxo5gjINxV40ffDpbAVDVC0%2BatPOWwTVS06Q3coUkkdMNSUnsf87qDsZMBi0RbT%2B5dV%2Bl336ZyFayEJbYKYuuGpG629Xhc17BUFoaCxJeK7sig1prmNnX37LMJGE1xIPnp34nXudXTLvJBto%2BLnamx3z6SXhaPI3ICdjHTawKIaSbuYGMFm6xjYORolHzzUv6JbWeTCV1bg5%2Ful2eLQsNAP%2BIW9HC31xSYWcKlj4J2OSY3OAhZ0Fukoh3Icuc%2B%2F76RvcPUP1ydemkijSt3siGFhh20vx%2F3AWubEWQauDZAN4Hau1FAiEZ4QCt9hHG0b9sXDby%2B8UHLHzcG8w%2BYlSdgYKKwjSMINsO%2FgHckvnsU%2BrDskqzDb1ve%2BBjqkAUcnRbCFWdwaSUWoh7u7DsdIrNxEu26%2Ficv94Oy3KubcRM5PytPDj%2F3sxgXW4SYGSPPv2%2F836evAMN8CEwihCsoz4JUvNqme%2BoavjXrBgEcv6o1USUBNiQYMX0mienlrinXgNHSlwHDEL4NR3z9FtCmaTpsai0z3VkyJ7AoUTblkT2V71h1OSGz4gPnasFI9UXGw6tSUHlIypguNukVhe4%2BB%2By7J&X-Amz-Signature=98e540fa0ed5e4b5356cc61e01895e9535c551e0851b14fc177e11c4695b8048&X-Amz-SignedHeaders=host&x-id=GetObject',
        },
      ],
      answer: {
        items: [
          {
            type: 'text',
            text:
              'The image has its original colors inverted: dark colors appear lighter, and light sections appear darker. When you stare at the image for 20 seconds, the photoreceptors in your eyes become overstimulated, causing fatigue and loss of sensitivity. This is why you see a different image when your eyes are closed and resting.\n\nThese same photoreceptors are what cause people with color blindness to see colors differently than you do. At the end of this course, you will learn how to include them in your color palette choices.',
          },
        ],
      },
    },
  ],
};

export const Chapter1 = () => {
  return (
    <TextBasedCourseChapterView
      courseChapter={courseChapter1}
      onOpenTemplate={action('open template')}
      onCompleteTask={action('onCompleteTask')}
      isTaskCompleted={action('isTaskCompleted')}
      getChapterCompletion={action('getChapterCompletion')}
      chapterIndex={0}
      onBuyWithCredits={action('onBuyWithCredits')}
    />
  );
};
export const Chapter3 = () => {
  return (
    <TextBasedCourseChapterView
      courseChapter={courseChapter3}
      onOpenTemplate={action('open template')}
      onCompleteTask={action('onCompleteTask')}
      isTaskCompleted={action('isTaskCompleted')}
      getChapterCompletion={action('getChapterCompletion')}
      chapterIndex={0}
      onBuyWithCredits={action('onBuyWithCredits')}
    />
  );
};
