import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { userService } from '../services/userService';
import { postService } from '../services/postService';
import type { User } from '../services/userService';
import type { Post } from '../services/postService';

type EntityType = 'user' | 'post';
type Entity = User | Post;

export const ManagementPage: React.FC = () => {
  const [entityType, setEntityType] = useState<EntityType>('post');
  const [data, setData] = useState<Entity[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Entity | null>(null);

  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: "success" | "error", message: string}>({ show: false, type: "success", message: ""});
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
    setFormData({});
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedItem(null);
  }, [entityType]);

  const loadData = async () => {
    try {
      let result: Entity[];
      if (entityType === 'user') {
        result = await userService.getAll();
      } else {
        result = await postService.getAll();
      }
      setData(result);
    } catch (error: any) {
      showAlert("error", '데이터를 불러오는데 실패했습니다');
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => setAlertInfo({ show: false, type: "success", message: "" }), 3000);
  }

  const handleCreate = async () => {
    try {
      if (entityType === 'user') {
        await userService.create({
          username: formData.username,
          email: formData.email,
          role: formData.role || 'user',
          status: formData.status || 'active',
        });
      } else {
        await postService.create({
          title: formData.title,
          content: formData.content || '',
          author: formData.author,
          category: formData.category,
          status: formData.status || 'draft',
        });
      }
      await loadData();
      setIsCreateModalOpen(false);
      setFormData({});
      showAlert("success", `${entityType === 'user' ? '사용자' : '게시글'}가 생성되었습니다`);
    } catch (error: any) {
      showAlert("error", error.message || '생성에 실패했습니다');
    }
  };

  const handleEdit = (item: Entity) => {
    setSelectedItem(item);
    if (entityType === 'user') {
      const user = item as User;
      setFormData({ username: user.username, email: user.email, role: user.role, status: user.status });
    } else {
      const post = item as Post;
      setFormData({ title: post.title, content: post.content, author: post.author, category: post.category, status: post.status });
    }
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      if (entityType === 'user') {
        await userService.update(selectedItem.id, formData);
      } else {
        await postService.update(selectedItem.id, formData);
      }
      await loadData();
      setIsEditModalOpen(false);
      setFormData({});
      setSelectedItem(null);
      showAlert("success", `${entityType === 'user' ? '사용자' : '게시글'}가 수정되었습니다`);
    } catch (error: any) {
      showAlert("error", error.message || '수정에 실패했습니다');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      if (entityType === 'user') {
        await userService.delete(id);
      } else {
        await postService.delete(id);
      }
      await loadData();
      showAlert("success", '삭제되었습니다');
    } catch (error: any) {
      showAlert("error", error.message || '삭제에 실패했습니다');
    }
  };



  const getStats = () => {
    if (entityType === 'user') {
      const users = data as User[];
      return {
        total: users.length,
        stat1: { label: '활성', value: users.filter(u => u.status === 'active').length, color: 'text-green-600', bg: "bg-green-100", border: "border-green-200" },
        stat2: { label: '비활성', value: users.filter(u => u.status === 'inactive').length, color: 'text-orange-600', bg: "bg-orange-100", border: "border-orange-200" },
        stat3: { label: '정지', value: users.filter(u => u.status === 'suspended').length, color: 'text-red-600', bg: "bg-red-100", border: "border-red-200" },
        stat4: { label: '관리자', value: users.filter(u => u.role === 'admin').length, color: 'text-blue-600', bg: "bg-blue-100", border: "border-blue-200" },
      };
    } else {
      const posts = data as Post[];
      return {
        total: posts.length,
        stat1: { label: '게시됨', value: posts.filter(p => p.status === 'published').length, color: 'text-green-600', bg: "bg-green-100", border: "border-green-200" },
        stat2: { label: '임시저장', value: posts.filter(p => p.status === 'draft').length, color: 'text-orange-600', bg: "bg-orange-100", border: "border-orange-200" },
        stat3: { label: '보관됨', value: posts.filter(p => p.status === 'archived').length, color: 'text-gray-600', bg: "bg-gray-100", border: "border-gray-200" },
        stat4: { label: '총 조회수', value: posts.reduce((sum, p) => sum + p.views, 0), color: 'text-blue-600', bg: "bg-blue-100", border: "border-blue-200" },
      };
    }
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">관리 시스템</h1>
          <p className="text-slate-500 mt-2">사용자와 게시글을 관리하세요</p>
        </div>

        {alertInfo.show && (
          <Alert variant={alertInfo.type === "error" ? "destructive" : "default"} className={alertInfo.type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}>
            <AlertTitle>{alertInfo.type === "success" ? "성공" : "오류"}</AlertTitle>
            <AlertDescription>{alertInfo.message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="pb-4 flex flex-row items-center justify-between border-b">
            <div className="flex gap-2">
              <Button 
                variant={entityType === 'post' ? 'default' : 'outline'} 
                onClick={() => setEntityType('post')}
              >
                게시글
              </Button>
              <Button 
                variant={entityType === 'user' ? 'default' : 'outline'} 
                onClick={() => setEntityType('user')}
              >
                사용자
              </Button>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              새로 만들기
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-200 shadow-none">
                <CardContent className="p-4">
                  <div className="text-xs font-medium text-slate-500 mb-1">전체</div>
                  <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                </CardContent>
              </Card>
              {[stats.stat1, stats.stat2, stats.stat3, stats.stat4].map((stat, i) => (
                <Card key={i} className={`shadow-none ${stat.bg} ${stat.border}`}>
                  <CardContent className="p-4">
                    <div className="text-xs font-medium text-slate-500 mb-1">{stat.label}</div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>{entityType === 'user' ? '사용자명' : '제목'}</TableHead>
                    <TableHead>{entityType === 'user' ? '이메일' : '작성자'}</TableHead>
                    <TableHead>{entityType === 'user' ? '역할' : '카테고리'}</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>{entityType === 'user' ? '생성일' : '조회수'}</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                        데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{entityType === 'user' ? (item as User).username : (item as Post).title}</TableCell>
                        <TableCell>{entityType === 'user' ? (item as User).email : (item as Post).author}</TableCell>
                        <TableCell>{entityType === 'user' ? (item as User).role : (item as Post).category}</TableCell>
                        <TableCell>
                          <Badge variant={
                            item.status === 'active' || item.status === 'published' ? 'default' :
                            item.status === 'inactive' || item.status === 'draft' ? 'secondary' :
                            'destructive'
                          }>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{entityType === 'user' ? item.createdAt : (item as Post).views}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>수정</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>삭제</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 새 데이터 생성 모달 - 다이얼로그 폼 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>새 {entityType === 'user' ? '사용자' : '게시글'} 만들기</DialogTitle>
            <DialogDescription>
              아래 폼을 입력하여 새로운 {entityType === 'user' ? '사용자' : '게시글'} 데이터를 추가하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {entityType === 'user' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">사용자명</Label>
                  <Input id="username" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="사용자명을 입력하세요" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="이메일을 입력하세요" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>역할</Label>
                    <Select value={formData.role || 'user'} onValueChange={val => setFormData({...formData, role: val})}>
                      <SelectTrigger><SelectValue placeholder="역할 선택" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">사용자</SelectItem>
                        <SelectItem value="moderator">운영자</SelectItem>
                        <SelectItem value="admin">관리자</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>상태</Label>
                    <Select value={formData.status || 'active'} onValueChange={val => setFormData({...formData, status: val})}>
                      <SelectTrigger><SelectValue placeholder="상태 선택" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="inactive">비활성</SelectItem>
                        <SelectItem value="suspended">정지</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input id="title" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="제목을 입력하세요" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">작성자</Label>
                    <Input id="author" value={formData.author || ''} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="작성자명" />
                  </div>
                  <div className="space-y-2">
                    <Label>카테고리</Label>
                    <Select value={formData.category || ''} onValueChange={val => setFormData({...formData, category: val})}>
                      <SelectTrigger><SelectValue placeholder="카테고리 선택" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="accessibility">Accessibility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea id="content" value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="게시글 내용을 입력하세요" />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>취소</Button>
            <Button onClick={handleCreate}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{entityType === 'user' ? '사용자' : '게시글'} 수정</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {entityType === 'user' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-username">사용자명</Label>
                  <Input id="edit-username" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">이메일</Label>
                  <Input id="edit-email" type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>역할</Label>
                    <Select value={formData.role || 'user'} onValueChange={val => setFormData({...formData, role: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">사용자</SelectItem>
                        <SelectItem value="moderator">운영자</SelectItem>
                        <SelectItem value="admin">관리자</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>상태</Label>
                    <Select value={formData.status || 'active'} onValueChange={val => setFormData({...formData, status: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="inactive">비활성</SelectItem>
                        <SelectItem value="suspended">정지</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-title">제목</Label>
                  <Input id="edit-title" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-author">작성자</Label>
                    <Input id="edit-author" value={formData.author || ''} onChange={e => setFormData({...formData, author: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>카테고리</Label>
                    <Select value={formData.category || ''} onValueChange={val => setFormData({...formData, category: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="accessibility">Accessibility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-content">내용</Label>
                  <Textarea id="edit-content" value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>취소</Button>
            <Button onClick={handleUpdate}>수정 완료</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
