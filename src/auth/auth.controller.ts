import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { TransformDTO } from 'src/_cores/interceptors/transform-dto.interceptor';
import { SignInDto } from './dto/sign-in.dto';
import { ResponseUserDto } from 'src/user/dto/response-user.dto';

@Controller('auth')
@TransformDTO(ResponseUserDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('/sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
  @Post('/google')
  googleAuth(@Body() body: { idToken: string }) {
    return this.authService.googleAuth(body.idToken);
  }

  @Post('/logout/:id')
  async logout(@Param('id') userId: string) {
    return this.authService.logout(userId);
  }
}
